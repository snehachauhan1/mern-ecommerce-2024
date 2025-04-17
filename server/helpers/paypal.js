const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode:"sandbox",
  client_id:"Ae9el9oFqGBuAoY1XYk_UA775ceE-wtd4dRuvVgxL4Q_MTf-V9cJbwBrZc17ODa_xrSUJsbXbOKaPzbz",
  client_secret:"EOjZ3VztqNpi2o2lrjhfPC7gMKwehOb9jBA081RRNV9KWF6zNxbW86BmYUhWXGRgPrITvSqnzqq9i-YR",
});

module.exports = paypal;
