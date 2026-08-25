import { BuiltInVoice, TagCategory, DirectorPreset } from '../types';

export const BUILT_IN_VOICES: BuiltInVoice[] = [
  {
    id: 'mimo_default',
    name: 'MiMo-默认',
    language: '中文',
    gender: '中性',
    description: '集群智能默认音色（中国集群默认为冰糖，海外集群为 Mia）',
    recommendedTags: ['助手播报', '多语言通用'],
  },
  {
    id: '冰糖',
    name: '冰糖',
    language: '中文',
    gender: '女性',
    description: '清澈甜美、生动活泼，适合日常助手、生活对话、解说与伴读',
    recommendedTags: ['甜美', '活泼', '助手'],
  },
  {
    id: '茉莉',
    name: '茉莉',
    language: '中文',
    gender: '女性',
    description: '温柔知性、从容优雅，适合有声书朗读、情感故事与晚安电台',
    recommendedTags: ['温柔', '知性', '有声书'],
  },
  {
    id: '苏打',
    name: '苏打',
    language: '中文',
    gender: '男性',
    description: '阳光清爽、明朗亲切，适合日常陪伴、年轻角色、知识科普',
    recommendedTags: ['阳光', '少年感', '科普'],
  },
  {
    id: '白桦',
    name: '白桦',
    language: '中文',
    gender: '男性',
    description: '沉稳厚重、富有磁性与故事感，适合纪录片旁白、新闻播报、严肃演绎',
    recommendedTags: ['磁性', '沉稳', '纪录片'],
  },
  {
    id: 'Mia',
    name: 'Mia',
    language: '英文',
    gender: '女性',
    description: '自然流畅的当代美音女声，发音清晰纯正，适合全场景英文表达',
    recommendedTags: ['Natural', 'English', 'Conversational'],
  },
  {
    id: 'Chloe',
    name: 'Chloe',
    language: '英文',
    gender: '女性',
    description: '活泼明朗、富有感染力与情绪起伏，适合英文解说与戏剧演绎',
    recommendedTags: ['Energetic', 'Storytelling', 'Bright'],
  },
  {
    id: 'Milo',
    name: 'Milo',
    language: '英文',
    gender: '男性',
    description: '阳光青年男声，清晰有力、充满干劲，适合英文播客与现代对话',
    recommendedTags: ['Youthful', 'Podcast', 'Dynamic'],
  },
  {
    id: 'Dean',
    name: 'Dean',
    language: '英文',
    gender: '男性',
    description: '深沉磁性的专业英文男声，适合商业旁白、影视译制与纪录片',
    recommendedTags: ['Deep', 'Narrator', 'Corporate'],
  },
];

export const TAG_CATEGORIES: TagCategory[] = [
  {
    category: '基础情绪 (开头)',
    description: '置于待合成文本开头，支持多重组合，如 (开心 俏皮)',
    tags: [
      { label: '开心', tag: '(开心)', desc: '欢快喜悦' },
      { label: '悲伤', tag: '(悲伤)', desc: '低落哀伤' },
      { label: '愤怒', tag: '(愤怒)', desc: '严厉斥责' },
      { label: '平静', tag: '(平静)', desc: '从容淡定' },
      { label: '冷漠', tag: '(冷漠)', desc: '冰冷疏离' },
      { label: '委屈', tag: '(委屈)', desc: '带哭腔委屈' },
      { label: '兴奋', tag: '(兴奋)', desc: '高昂激动' },
      { label: '恐惧', tag: '(恐惧)', desc: '慌张不安' },
      { label: '惊讶', tag: '(惊讶)', desc: '诧异惊叹' },
    ],
  },
  {
    category: '复合情绪与语调',
    description: '细腻有层次的复杂情感与整体调性',
    tags: [
      { label: '怅然', tag: '(怅然)', desc: '若有所失' },
      { label: '欣慰', tag: '(欣慰)', desc: '由衷欣喜' },
      { label: '无奈', tag: '(无奈)', desc: '叹息妥协' },
      { label: '释然', tag: '(释然)', desc: '放下释怀' },
      { label: '动情', tag: '(动情)', desc: '深情款款' },
      { label: '温柔', tag: '(温柔)', desc: '轻柔治愈' },
      { label: '慵懒', tag: '(慵懒)', desc: '漫不经心' },
      { label: '磁性', tag: '(磁性)', desc: '醇厚深沉' },
      { label: '御姐音', tag: '(御姐音)', desc: '霸气知性' },
      { label: '夹子音', tag: '(夹子音)', desc: '甜软可爱' },
      { label: '大叔音', tag: '(大叔音)', desc: '沧桑厚重' },
    ],
  },
  {
    category: '方言与特色模式',
    description: '地道方言特色或特殊演绎模式',
    tags: [
      { label: '🎤 唱歌模式', tag: '(唱歌)', desc: '以旋律唱出歌词（置于最前）' },
      { label: '东北话', tag: '(东北话)', desc: '幽默豪爽' },
      { label: '四川话', tag: '(四川话)', desc: '麻辣风趣' },
      { label: '粤语', tag: '(粤语)', desc: '港风地道' },
      { label: '河南话', tag: '(河南话)', desc: '质朴亲切' },
      { label: '台湾腔', tag: '(台湾腔)', desc: '软萌温和' },
      { label: '孙悟空', tag: '(孙悟空)', desc: '经典角色扮演' },
      { label: '林黛玉', tag: '(林黛玉)', desc: '弱柳扶风娇柔' },
    ],
  },
  {
    category: '句中动作与呼吸 [音频标签]',
    description: '可任意插入在文本中间，精准控制停顿、气息与哭笑',
    tags: [
      { label: '💨 吸气', tag: '[吸气]', isAudioTag: true, desc: '轻微吸气' },
      { label: '😮‍💨 深呼吸', tag: '[深呼吸]', isAudioTag: true, desc: '平复心情' },
      { label: '😔 叹气', tag: '[叹气]', isAudioTag: true, desc: '轻微叹息' },
      { label: '😩 长叹一口气', tag: '[长叹一口气]', isAudioTag: true, desc: '沉重悠长' },
      { label: '⏳ 沉默片刻', tag: '[沉默片刻]', isAudioTag: true, desc: '自然停顿留白' },
      { label: '🤭 轻笑', tag: '[轻笑]', isAudioTag: true, desc: '浅浅抿嘴笑' },
      { label: '😆 大笑', tag: '[大笑]', isAudioTag: true, desc: '开怀放声' },
      { label: '😏 冷笑', tag: '[冷笑]', isAudioTag: true, desc: '不屑嘲弄' },
      { label: '🥺 抽泣', tag: '[抽泣]', isAudioTag: true, desc: '断续哭泣' },
      { label: '💔 哽咽', tag: '[哽咽]', isAudioTag: true, desc: '喉头一紧' },
      { label: '😷 咳嗽', tag: '[咳嗽]', isAudioTag: true, desc: '轻咳两声' },
      { label: '〰️ 声音颤抖', tag: '[声音颤抖]', isAudioTag: true, desc: '紧张恐惧' },
    ],
  },
];

export const DIRECTOR_PRESETS: DirectorPreset[] = [
  {
    id: 'noble_lady',
    title: '👑 门阀掌门人（冷傲御姐）',
    role: '百年门阀的大当家，自幼被塑造成绝情断欲的家族图腾，常年深居简出，对人有着极强的阶级疏离感。',
    scene: '在家族祠堂的阴影里，看着企图带她私奔的男人，用最冷硬的阶级壁垒绞杀对方和自己的微弱情愫。',
    guidance: `冰冷、慵懒却极具威压的低音御姐。
- 语速与顿挫：极慢，每个字带着上位者漫不经心的傲慢。句与句之间留下令人不安的空白。
- 气声与实声：大部分时间实音重且硬，但在某些尾音（如“真心”）加入极轻微的气音收束，透出连自己都未察觉的疲惫。
- 咬字肌理：文白杂糅，唇齿音发得极轻但极清晰。`,
    sampleText: '走到这一步，你以为凭一腔所谓的热血，就能抹平三百年积攒下来的门第沟壑？别天真了。',
  },
  {
    id: 'cyberpunk_detective',
    title: '🕵️ 赛博侦探（沙哑烟嗓）',
    role: '常年浸泡在雨夜与廉价合成酒精里的落魄私家侦探，看透了霓虹灯下的黑幕，声音低沉沧桑。',
    scene: '靠在滴水的霓虹灯牌旁点燃最后一根香烟，给联络人发送最后的告别录音。',
    guidance: `略带沙哑的醇厚烟嗓，气息下沉。
- 语速与节奏：不疾不徐，带着宿醉后的松弛与警惕。在句子末尾伴随微弱的吐气声。
- 情绪：疲倦但坚定，冷峻中掩藏着最后一丝未熄灭的良知。`,
    sampleText: '数据芯片我放在老地方了。[长叹一口气] 别去找我，从今天起，这个城市再没有代号叫渡鸦的人。',
  },
  {
    id: 'bedtime_host',
    title: '🌙 深夜治愈电台 DJ',
    role: '陪伴城市晚归人的温暖电台主播，声音柔软耳语，像冬日里的热可可。',
    scene: '午夜一点的静谧录音间，为疲惫了一天的听众道晚安。',
    guidance: `极度贴耳的近场麦克风质感，带自然微弱的唇齿声与放松的气息。
- 语速：极慢而舒缓，语调如流水般波澜不惊。
- 语气：充满真诚的关怀与包容。`,
    sampleText: '夜已经深了，无论今天经历了什么，[深呼吸] 此时此刻，请允许自己彻底放松下来。晚安，做个好梦。',
  },
  {
    id: 'game_caster',
    title: '⚡ 连珠炮电竞解说',
    role: '激情澎湃的电竞赛事主解说，能在0.5秒内捕捉战场变化并用机关枪般的语速引爆全场。',
    scene: '世界总决赛最后一波决定胜负的远古龙团战，局势瞬间逆转。',
    guidance: `高亢、极具穿透力与感染力的青年男声。
- 语速：极快，像连珠炮一样密集，爆发力极强。
- 节奏：在关键击杀瞬间音调陡然拔高，伴随激动的破音边缘演绎。`,
    sampleText: '看这个走位！闪现向前！直接大招控住四个！[大笑] 奇迹行者！他们创造了奇迹！恭喜夺冠！',
  },
];

export const VOICE_DESIGN_PRESETS = [
  {
    title: '👴 北方评书说书先生',
    prompt: '一位年迈的老先生，说带北方口音的普通话，语速缓慢而沉稳，嗓音略带沙哑和沧桑感，仿佛一位饱经风霜的老爷爷在讲故事，充满岁月的智慧。',
    sampleText: '那一年大雪封山，我们几个人围在火炉旁，听着窗外的风声，谁也没想到后来的变化会这么大。',
  },
  {
    title: '🎧 耳语 ASMR 治愈女声',
    prompt: 'Young female, extreme close-up with a binaural, ear-to-ear ASMR feel. Audible breathing, subtle swallowing, and soft natural lip sounds. She speaks very slowly, creating a deeply relaxing and immersive experience.',
    sampleText: 'Close your eyes, take a deep breath... and just let go of all the tension in your shoulders.',
  },
  {
    title: '🦾 机械科幻 AI 语音助手',
    prompt: '冷静、严谨且富有磁性的未来人工智能系统，中性偏女性声线，语速平稳匀称，无情绪波动的绝对理性感。',
    sampleText: '环境自检已完成。动力系统输出正常，量子导航信标已锁定，随时可以启动跃迁。',
  },
  {
    title: '💼 顶级投行商业导师',
    prompt: '四十五岁左右的资深投资人，声音沉稳自信、逻辑严密，语速适中，带有从容不迫的上位者气场与亲切感。',
    sampleText: '商业的本质不在于你跑得有多快，而在于当风暴来临时，你的护城河究竟有多深。',
  },
];
