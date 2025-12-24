import isPuppeteer from 'puppeteer-extra';
const puppeteer = isPuppeteer as any;
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export const parseOzonItem = async (input: string) => {
    const match = input.match(/(\d{8,12})/);
    const article = match ? match[0] : null;
    if (!article) throw new Error('Артикул Ozon не найден');
    
    const url = `https://www.ozon.ru/product/${article}/`;

    const browser = await puppeteer.launch({
        headless: "new", // Или true
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-infobars',
            '--window-size=1920,1080',
            '--start-maximized',
        ]
    });

    const page = await browser.newPage();

    try {
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

        console.log(`[Ozon] Маскировка...`);
        
        await page.goto('https://www.ozon.ru/', { waitUntil: 'networkidle2', timeout: 45000 });
        await new Promise(r => setTimeout(r, 2000));

        console.log(`[Ozon] Переход на товар: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        await page.mouse.wheel({ deltaY: 500 });
        await new Promise(r => setTimeout(r, 5000));

        const result = await page.evaluate(() => {
            const cleanPrice = (t: string | null) => t ? parseInt(t.replace(/[^\d]/g, '').replace(/\s/g, '')) : 0;

            const nameEl = document.querySelector('h1');
            
            const allElements = Array.from(document.querySelectorAll('span'));
            const priceElements = allElements.filter(el => el.textContent?.includes('₽'));
            
            const priceWithCard = document.querySelector('.tsHeadline600Large')?.textContent;
            const priceNoCard = document.querySelector('.tsHeadline500Medium')?.textContent;
            const priceOld = document.querySelector('span[class*="pdp_g3b"]')?.textContent;

            const imgEl = document.querySelector('img[src*="wc1000"]') as HTMLImageElement;

            return {
                name: nameEl?.textContent?.trim() || null,
                currentPrice: cleanPrice(priceWithCard || null),
                oldPrice: cleanPrice(priceNoCard || priceOld || null),
                imageUrl: imgEl ? imgEl.src : ""
            };
        });

        if (!result.name || result.currentPrice === 0) {
            await page.screenshot({ path: '/app/ozon_debug.png' });
            throw new Error("Данные не найдены (капча или пустая страница)");
        }

        return { wbId: parseInt(article), ...result };

    } catch (e: any) {
        await page.screenshot({ path: '/app/ozon_debug.png' });
        console.log("Скриншот Ozon сохранен для анализа.");
        throw e;
    } finally {
        await browser.close();
    }
};