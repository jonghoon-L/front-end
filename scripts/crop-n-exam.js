const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '../public/images/about/n_exam.jpg');
const tempPath = path.join(__dirname, '../public/images/about/n_exam_cropped.jpg');

async function crop() {
  const metadata = await sharp(inputPath).metadata();
  const { width, height } = metadata;

  // 상단 헤더(2-6 수능 대비..., n수관 관리 안내) 제거 - 약 12% 상단 크롭
  const cropTop = Math.round(height * 0.12);
  const cropHeight = height - cropTop;

  await sharp(inputPath)
    .extract({ left: 0, top: cropTop, width, height: cropHeight })
    .jpeg({ quality: 90 })
    .toFile(tempPath);

  fs.renameSync(tempPath, inputPath);
  console.log(`Cropped: removed top ${cropTop}px`);
}

crop().catch(console.error);
