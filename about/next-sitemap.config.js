// next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://dervisgenc.com', // Sitenin tam URL'si - ÇOK ÖNEMLİ
    generateRobotsTxt: true, // Manuel robots.txt kullanacağımız için false
    // Eğer robots.txt'yi de bunun üretmesini istersen true yapıp public'deki robots.txt'yi silebilirsin.
    // generateIndexSitemap: false, // Az sayıda sayfan varsa false kalabilir
}