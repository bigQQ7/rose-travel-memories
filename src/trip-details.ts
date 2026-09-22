import type { GalleryItem } from '../components/AccordionGallery';
export const tripDetails: { feeling: string[]; photos: GalleryItem[] }[] = [
  {
    feeling: [
      '2021 年的五月，我们第一次一起去旅行。现在翻到这些照片，还是会觉得，那时最开心的事，是终于可以和你一起，把普通的一天过成值得记很久的一天。',
      '落日下比出的爱心，挽在一起的手臂，靠近镜头的两张脸，还有并排举起的手链。那些小小的瞬间被照片留下来，也让“和你见面”成了这趟旅行里最好的礼物。',
      '后来我们去了更多地方，但杭州一直是特别的一站。因为从这里开始，旅行的回忆里有了一个固定的人：你。'
    ],
    photos: [
      {image:'./assets/hangzhou-1.jpg',label:'爱在落日黄昏时'},
      {image:'./assets/hangzhou-2.png',label:'挽着你慢慢走'},
      {image:'./assets/hangzhou-3.png',label:'镜头里的我们'},
      {image:'./assets/hangzhou-4.png',label:'最好的礼物，是和你见面'},
      {image:'./assets/hangzhou-5.jpg',label:'乌镇的一段时光'}
    ]
  },
  {feeling:['九月，我们把一起旅行的故事写到了成都。看着熊猫前的这张合照，最先记起的，是我们靠在一起对着镜头比出的手势，还有那天明亮的笑脸。','我喜欢这样的旅行：去哪里都好，身边有你，就会忍不住多拍几张照片、多留住一点当下。以后再翻相册，也能一下子回到那份开心里。'],photos:[{image:'./assets/trip-2.png',label:'成都，和你一起'}]},
  {feeling:['这一程，我们一起去了广西和重庆。两个地方被写进同一段回忆里，而照片里戴着黄色眼镜、笑得很开心的我们，是我最想留下的画面。','旅行结束以后，很多细节会慢慢模糊，但一起出发、一起笑过的感觉还在。很高兴，这一段路也是和你走的。'],photos:[{image:'./assets/trip-3.jpg',label:'把快乐留在这一程'}]},
  {feeling:['2024 年的一月，照片里是一望无际的雪，也是笑得很开心的我们。赛里木湖的冬天，就这样和你的样子一起留在了我的记忆里。','我很喜欢这张合照：不需要摆得多认真，只要两个人在一起，连冬日的画面都觉得暖了一点。希望很多年以后，我们还能记得当时的快乐。'],photos:[{image:'./assets/gallery-2-1.jpg',label:'夜色里的合照'},{image:'./assets/gallery-2-2.png',label:'一起出发'},{image:'./assets/gallery-2-3.png',label:'阳光正好'},{image:'./assets/gallery-2-4.png',label:'熊猫的午餐'},{image:'./assets/gallery-2-5.png',label:'热辣的成都'}]},
  {feeling:['一年以后，我们又一起回到了赛里木湖。看到相册里再次出现这个名字，觉得很奇妙：有些地方，因为一起去过，就会想再和同一个人回来。','这次的合照，也被认真收进了我们的旅行手记。想和你去新的地方，也想和你重走喜欢的路，让“我们一起”一直有下一页。'],photos:[{image:'./assets/gallery-3-1.jpg',label:'今晚也很开心'},{image:'./assets/gallery-3-2.png',label:'海边落日'},{image:'./assets/gallery-3-3.jpg',label:'和你去看海'},{image:'./assets/gallery-3-4.png',label:'窗边的慢时光'},{image:'./assets/gallery-3-5.jpg',label:'雨中的阳朔'}]}
];
