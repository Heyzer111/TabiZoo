import axios from 'axios';
import fs from 'fs/promises';
import chalk from 'chalk';
import readline from 'readline';
import gradient from 'gradient-string';
import { HttpsProxyAgent } from 'https-proxy-agent';

const urlClaim = 'https://app.tabibot.com/api/mining/claim';
const urlProfile = 'https://app.tabibot.com/api/user/profile';
const urlLevelUp = 'https://app.tabibot.com/api/user/level-up';
const urlGetIP = 'https://api.ipify.org?format=json';

async function getConfig() {
    try {
        const config = await fs.readFile('config.json', 'utf8');
        return JSON.parse(config);
    } catch (error) {
        console.error(chalk.red('Lỗi khi đọc file config.json:'), chalk.yellow(error.message));
        return { autoUpgrade: false };
    }
}

async function getRawDataFromFile() {
    try {
        const rawdata = await fs.readFile('rawdata.txt', 'utf8');
        return rawdata.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    } catch (error) {
        console.error(chalk.red('Lỗi khi đọc file rawdata.txt:'), chalk.yellow(error.message));
        return [];
    }
}

async function getProxiesFromFile() {
    try {
        const proxies = await fs.readFile('proxies.txt', 'utf8');
        return proxies.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    } catch (error) {
        console.error(chalk.red('Lỗi khi đọc file proxies.txt:'), chalk.yellow(error.message));
        return [];
    }
}

async function getUserProfile(headers, proxy) {
    try {
        const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;
        const response = await axios.get(urlProfile, { headers, httpsAgent: agent });
        return response.data;
    } catch (error) {
        console.error(chalk.red('Lỗi khi gọi API profile:'), chalk.yellow(error.message));
        return null;
    }
}

async function claimMining(headers, proxy) {
    try {
        const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;
        const response = await axios.post(urlClaim, {}, { headers, httpsAgent: agent });
        return response.data;
    } catch (error) {
        console.error(chalk.red('Lỗi khi gọi API claim:'), chalk.yellow(error.message));
        return null;
    }
}

async function levelUp(headers, level, proxy) {
    try {
        const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;
        const response = await axios.post(urlLevelUp, { level }, { headers, httpsAgent: agent });
        return response.data;
    } catch (error) {
        console.error(chalk.red('Lỗi khi gọi API level-up:'), chalk.yellow(error.message));
        return null;
    }
}

async function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function getPublicIP(proxy) {
    try {
        const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;
        const response = await axios.get(urlGetIP, { httpsAgent: agent });
        return response.data.ip;
    } catch (error) {
        console.error(chalk.red('Lỗi khi lấy địa chỉ IP công cộng:'), chalk.yellow(error.message));
        return null;
    }
}

async function processAccount(rawdata, autoUpgrade, proxy) {
    console.log(chalk.green(`Đang sử dụng proxy: ${proxy}`));
    
    const headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Host': 'app.tabibot.com',
        'Origin': 'https://app.tabibot.com',
        'Referer': 'https://app.tabibot.com/?tgWebAppStartParam=APF7CS',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Rawdata': rawdata 
    };

    const profileData = await getUserProfile(headers, proxy);
    if (profileData) {
        console.log(chalk.green('---- Đăng nhập thành công ----'));
        console.log(chalk.cyan(`ID: ${profileData.id}`));
        console.log(chalk.cyan(`Tên tài khoản: ${profileData.name}`));
        console.log(chalk.cyan(`Level hiện tại: ${profileData.level}`));
        console.log(chalk.cyan(`Coins: ${profileData.coins}`));
        console.log(chalk.blue('Đang claim...'));

        const claimResult = await claimMining(headers, proxy);
        if (claimResult) {
            console.log(chalk.green('Claim thành công. Số dư hiện tại: '), chalk.yellow(profileData.coins));
        } else {
            console.log(chalk.red('Claim không được, chưa đến giờ.'));
        }

        if (autoUpgrade) {
            console.log(chalk.blue('Đang nâng cấp level...'));
            let levelUpResult;
            do {
                levelUpResult = await levelUp(headers, profileData.level + 1, proxy);
                if (levelUpResult && levelUpResult.success) {
                    const updatedProfile = await getUserProfile(headers, proxy);
                    profileData.level = updatedProfile.level; // Cập nhật cấp độ sau mỗi lần nâng cấp
                    profileData.coins = updatedProfile.coins; // Cập nhật số dư sau mỗi lần nâng cấp
                    console.log(chalk.green(`Nâng cấp thành công. Level hiện tại: ${profileData.level}`));
                    console.log(chalk.cyan(`Coins hiện tại: ${profileData.coins}`));
                } else {
                    console.log(chalk.red('Nâng cấp thất bại, số dư không đủ.'));
                    break;
                }
            } while (levelUpResult && levelUpResult.success);
        }
    }
}

async function main() {
    const config = await getConfig();
    const rawdataList = await getRawDataFromFile();
    const proxyList = await getProxiesFromFile();
    if (rawdataList.length === 0) {
        console.log(chalk.red('Không có dữ liệu rawdata.'));
        return;
    }
    if (proxyList.length === 0) {
        console.log(chalk.red('Không có dữ liệu proxy.'));
        return;
    }

    const logo = `
     _                             _              
    | |                           | |             
  __| |__      __ __ _  _ __    __| |  ___ __   __
 / _\` |\\ \\ /\\ / // _\` || '_ \\  / _\` | / _ \\\\ \\ / /
| (_| | \\ V  V /| (_| || | | || (_| ||  __/ \\ V / 
 \\__,_|  \\_/\\_/  \\__,_||_| |_| \\__,_| \\___|  \\_/  
                                                  
                                                  
`;

    const rainbow = gradient.rainbow.multiline(logo);

    console.log(rainbow);

    const publicIP = await getPublicIP(config.proxy);
    if (publicIP) {
        console.log(chalk.green(`Địa chỉ IP công cộng của bạn là: ${publicIP}`));
    }

    while (true) {
        for (let i = 0; i < rawdataList.length; i++) {
            const proxy = proxyList[i % proxyList.length];
            console.log(chalk.magenta(`\n==== Đang xử lý tài khoản ${i + 1}/${rawdataList.length} ==== \n`));
            await processAccount(rawdataList[i], config.autoUpgrade, proxy);
        }

        console.log(chalk.green("============== Tất cả tài khoản đã được xử lý ==============="));
        for (let i = 10; i > 0; i--) {
            process.stdout.write(chalk.yellow(`Đang xử lý lại tất cả tài khoản trong ${i} giây...\r`));
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log();
    }
}

main();
