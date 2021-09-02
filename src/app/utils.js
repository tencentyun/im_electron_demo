exports.getFileTypeName = (fileName) => {
  const match = fileName.match(/\.(\w+)$/);
  return match ? match[1] : "unknow";
};