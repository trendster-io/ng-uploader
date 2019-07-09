const { CREATED, UNPROCESSABLE_ENTITY } = require('http-status');

module.exports.saveFile = async (req, res) => {
  if (!req.file) {
    return res.status(UNPROCESSABLE_ENTITY).json({
      msg: 'An error occurred while uploading your file.',
    });
  }
  // Save the file path to database
  await Promise.resolve(); // To-do: replace with actual logic

  const newFilePath = req.file.path;
  res.status(CREATED).json({
    msg: `Your file was uploaded successfully.`,
    data: { newFilePath },
  });
};
