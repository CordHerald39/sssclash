import softwareData from '../data/software.json';
import airportData from '../data/airports.json';
import articleData from '../data/articles.json';
import generatedData from '../data/generated-articles.json';
import releaseData from '../data/releases.json';

export interface Software {
  slug: string; name: string; subtitle: string; description: string; platforms: string[];
  kind: string; status: string; repo: string; official: string; download: string;
  symbol: string; color: string; features: string[]; faqs: { q: string; a: string }[];
  platformDownloads?: Record<string,string>;
}
export interface Plan { name: string; price: number; period: string; traffic: number; details: string[] }
export interface Airport {
  slug: string; name: string; domain: string; symbol: string; color: string;
  description: string; focus: string; plans: Plan[];
}
export interface Section {
  heading: string; paragraphs: string[]; list?: string[]; links?: { text: string; href: string }[];
}
export interface Article {
  slug: string; title: string; description: string; category: string; tags: string[];
  publishedAt: string; updatedAt: string; cover: string; software: string[]; airports: string[]; sections: Section[];
}
export const software: Software[] = softwareData;
export const airports: Airport[] = airportData;
export const releases = releaseData as Record<string, { version: string; url: string; publishedAt: string }>;
const softwareGuides: Article[] = software.map((s) => ({
  slug: `${s.slug}-guide`,
  title: s.status === 'legacy' ? `${s.name} 迁移教程与替代软件选择` : `${s.name} 下载与使用教程`,
  description: `${s.name} 的适用平台、安装入口、配置导入与常见问题。${s.description}`,
  category: '教程', tags: [s.name, ...s.platforms, s.status === 'legacy' ? '迁移' : '安装'],
  publishedAt: '2026-10-01', updatedAt: '2026-10-01', cover: s.kind === 'core' ? 'routing' : 'tutorial',
  software: [s.slug], airports: [],
  sections: [
    { heading: s.status === 'legacy' ? '先保留旧配置' : '确认平台与安装入口', paragraphs: [
      s.description,
      s.status === 'legacy'
        ? '迁移前保留订阅入口、自定义规则和必要的覆写设置。原程序的数据目录不要直接删除，先在新客户端验证配置能读取、代理组能选择、应用可以按预期连接。客户端与节点服务是不同部分，更换软件不意味着必须重新购买套餐。'
        : `此页覆盖 ${s.platforms.join('、')}。安装前检查系统版本和处理器架构，再进入项目发布入口选择对应文件。不要根据名称相近就使用其他项目的安装包。${s.kind === 'related' ? '此工具有自己的商店和配置格式，购买及安装按对应项目说明进行。' : s.kind === 'core' ? '这是代理内核，不包含完整桌面界面。配置与启动步骤按内核文档进行，新手可选带 GUI 的客户端。' : '桌面和移动端的权限机制不同，首次启动时按当前版本的说明确认所需权限。'}`
    ], links: [{ text: `${s.name} 软件详情与 FAQ`, href: `/software/${s.slug}/` }] },
    { heading: '导入并启用兼容配置', paragraphs: [
      '从自己的服务商面板获取与客户端兼容的订阅。配置入口与购买链接不是同一个地址，粘贴前确认格式和完整性。添加记录后等待下载，检查代理组与节点，再启用当前配置。',
      `${s.name} 的菜单名称和其他软件可能不同，操作时以当前界面为准。对于已维护的自定义规则，先了解软件的覆写机制；订阅更新可能替换远程配置，不要把需要保留的修改直接写进会被覆盖的内容。`
    ], links: [{ text: '订阅导入、更新与重置的区别', href: '/articles/import-subscription/' }] },
    { heading: '检查连接与日常更新', paragraphs: [
      '选择可用节点后先完成一次简单连接，再检查代理模式和接管方式。桌面上的系统代理不一定影响每个程序，Android 需要确认活动 VPN 权限。观察连接记录有助于分清规则问题、节点问题和应用未使用代理。',
      '更新软件之前保留现有可用配置，并阅读发行说明。只从本页链接的项目入口获取安装包；更新完成后依次检查订阅、代理组和网络恢复。版本新旧与服务套餐是否有效是两件事。'
    ], links: [{ text: '规则、全局与直连模式说明', href: '/articles/proxy-modes/' }] },
    ...s.faqs.map((faq) => ({ heading: faq.q, paragraphs: [faq.a] }))
  ]
}));
export const articles: Article[] = [...articleData as Article[], ...softwareGuides, ...generatedData as Article[]];
export const tags = [...new Set(articles.flatMap((a) => a.tags))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
export const platforms = ['Windows', 'macOS', 'Linux', 'Android', 'iOS'];
export const nav = [
  { href: '/', text: '首页' }, { href: '/software/', text: '软件大全' }, { href: '/download/', text: '下载中心' },
  { href: '/airports/', text: '机场推荐' }, { href: '/ranking/', text: '机场榜单' },
  { href: '/cheap/', text: '便宜机场' }, { href: '/articles/', text: '文章' }
];
export const tagUrl = (tag: string) => `/tags/${encodeURIComponent(tag)}/`;
export const ogKey = (path: string) => path === '/' ? 'home' : decodeURIComponent(path).replace(/^\/+|\/+$/g, '').replaceAll('/', '-');
export const imageFor = (key: string) => `/images/${['hero','airports','tutorial','routing','troubleshooting'].includes(key) ? key : 'tutorial'}.webp`;
export const dateLabel = (value: string) => value.slice(0, 10);
export const articleMinutes = (article: Article) => Math.max(2, Math.ceil(article.sections.flatMap((s) => s.paragraphs).join('').length / 400));

export interface Route {
  path: string; type: 'software-list' | 'software' | 'download' | 'airports' | 'ranking' | 'cheap' | 'airport' | 'articles' | 'article' | 'tag' | 'search' | 'about';
  title: string; description: string; image: string; software?: Software; airport?: Airport; article?: Article; tag?: string;
}
export const routes: Route[] = [
  { path: '/software/', type: 'software-list', title: 'Clash 软件大全', description: '按 Windows、macOS、Linux、Android 与 iOS 查找客户端、内核和相关工具，查看官方入口、下载教程与 FAQ。', image: 'hero' },
  { path: '/download/', type: 'download', title: 'Clash 下载中心', description: '按系统选择 Clash 客户端，进入项目官方下载入口，核对安装包、处理器架构和使用教程。', image: 'tutorial' },
  { path: '/airports/', type: 'airports', title: '机场推荐', description: '整理樱花猫、零点云、GW树洞等机场购买入口，按预算、设备和用量找到自己的选购方向。', image: 'airports' },
  { path: '/ranking/', type: 'ranking', title: '机场榜单', description: '集中查看 19 家机场入口与套餐信息，按名称搜索，进入详情页比较选购条件和购买方式。', image: 'airports' },
  { path: '/cheap/', type: 'cheap', title: '便宜机场怎么选', description: '从总价、有效期、可用流量和付款周期比较机场套餐，了解低预算和轻度使用的选购方法。', image: 'airports' },
  { path: '/articles/', type: 'articles', title: 'Clash 教程与文章', description: '阅读 Clash 安装、订阅导入、代理模式、连接故障与客户端对比文章，按系统和标签查找教程。', image: 'tutorial' },
  { path: '/search/', type: 'search', title: '搜索软件、机场与教程', description: '在素Clash中搜索客户端下载、机场购买入口和使用教程。', image: 'hero' },
  { path: '/about/', type: 'about', title: '关于素Clash', description: '素Clash整理客户端、下载入口、使用教程和机场选购内容，帮助按设备找到合适的下一步。', image: 'hero' },
  ...software.map((s): Route => ({ path: `/software/${s.slug}/`, type: 'software', title: `${s.name} 下载、教程与 FAQ`, description: s.description, image: 'tutorial', software: s })),
  ...airports.map((a): Route => ({ path: `/airports/${a.slug}/`, type: 'airport', title: `${a.name} 套餐与购买入口`, description: a.description, image: 'airports', airport: a })),
  ...articles.map((a): Route => ({ path: `/articles/${a.slug}/`, type: 'article', title: a.title, description: a.description, image: a.cover, article: a })),
  ...tags.map((tag): Route => ({ path: tagUrl(tag), type: 'tag', title: `${tag} 相关教程与文章`, description: `阅读 ${tag} 相关安装教程、使用方法与常见问题，找到对应的软件与操作说明。`, image: 'tutorial', tag }))
];
