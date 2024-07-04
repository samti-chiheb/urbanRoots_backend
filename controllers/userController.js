const User = require("../model/User");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users) return res.status(204).json({ "message": "No user found." });
  res.json(users);
};

const deleteUser = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ "message": "an id param is required" });
  }

  const user = await User.findOne({ _id: req.body.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ "message": `No employee match the ID : "${req.body.id}" .` });
  }

  const result = await user.deleteOne({ _id: req.body.id });
  res.json(result);
};

const getOneUser = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ "message": "an id param is required" });
  }

  const user = await User.findOne({ _id: req.params.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ "message": `No employee match the ID : "${req.params.id}" .` });
  }

  res.json(user);
};

module.exports = {
  getAllUsers,
  deleteUser,
  getOneUser,
};
