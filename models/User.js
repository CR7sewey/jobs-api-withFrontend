//https://mongoosejs.com/docs/validation.html#built-in-validators
//https://stackoverflow.com/questions/14588032/mongoose-password-hashing
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "must provide name"],
    trim: true,
    minlength: 3,
    maxlength: [20, "name can not be more than 20 characters"],
  },
  email: {
    type: String,
    /*match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email!'
    ]*/
    validate: {
      validator: function (m) {
        return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          m
        );
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
    required: [true, "must provide an email"],
    trim: true,
    unique: true, // NOT A VALIDATOR!!!
  },
  password: {
    type: String,
    required: [true, "must provide a password"],
    minlength: 6,
    maxlength: 20,
  },
});

// MONGOOSE MIDDLEWARE (BEFORE SAVING THE DOCUMENT!)
UserSchema.pre("save", async function save(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); // encriptografar password
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.methods.validatePassword = async function validatePassword(data) {
  return await bcrypt.compare(data, this.password);
};

UserSchema.methods.generateToken = function generateToken() {
  const token = jwt.sign(
    { userID: this._id, userName: this.name, userEmail: this.email },
    process.env.TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
  return token;
};

module.exports = mongoose.model("User", UserSchema);

/////////////////////////////////////////////////////////////////////////
/*
const mongoose = require("mongoose");
const validator = require("validator");
const bcriptjs = require("bcryptjs");
const { validate } = require("../../store-api/models/product");

// validacao caracteres
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const UserModel = mongoose.model("User", UserSchema); // retorna promise

class User {
  constructor(body) {
    this.body = body; // body para todos os metodos da classe
    this.errors = [];
    this.user = null;
  }

  valida() {
    this.cleanUp(); // limpa objeto
    // Validacao
    // Email
    if (!validator.isEmail(this.body.email)) {
      this.errors.push("E-mail invalid!");
    }

    //senha ter entre 3 e 8
    if (this.body.password.length < 3 || this.body.password.length > 8) {
      this.errors.push("Senha tem de ter entre 3 e 8 caracteres!");
    }
  }

  async userExists() {
    // async pq vamos à bd
    const user = await UserModel.findOne({ email: this.body.email });
    if (user) {
      this.errors.push("E-mail already registered!");
      return;
    }
  }

  async register() {
    // retorna promise pq é async, assim, no controler a funcao tmb tem de ser
    this.valida();
    if (this.errors.length > 0) {
      return;
    }

    await this.userExists();
    if (this.errors.length > 0) {
      return;
    }

    const salt = bcriptjs.genSaltSync();
    this.body.password = bcriptjs.hashSync(this.body.password, salt); // encriptografar password
    const user = await UserModel.create(this.body);
    this.user = user; // acessar no controler se quiser
  }

  cleanUp() {
    for (let key in this.body) {
      if (typeof this.body[key] !== "string") {
        this.body[key] = "";
      }
    }
    this.body = { email: this.body.email, password: this.body.password };
  }

  async login() {
    this.valida();
    if (this.errors.length > 0) {
      return;
    }

    this.user = await UserModel.findOne({ email: this.body.email });
    //console.log('AQUIII',this.user)
    if (!this.user) {
      console.log("AQUI3");
      this.errors.push("User doesnt exists!");
      return;
    }
    if (!bcriptjs.compareSync(this.body.password, this.user.password)) {
      this.errors.push("Password doesnt match!");
      this.user = null;
      return;
    }
  }
}

module.exports = User;
*/
