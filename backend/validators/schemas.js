
import Joi from 'joi';

const objectId = () => Joi.string().hex().length(24);
const phone = () => Joi.string().trim().pattern(/^[0-9+\s-]{9,15}$/).messages({ 'string.pattern.base': '{{#label}} must be a valid phone number' });

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60).required().label('Name'),
  email: Joi.string().trim().email().required().label('Email'),
  phone: phone().allow('', null).label('Phone'),
  password: Joi.string().min(6).max(72).required().label('Password'),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().label('Email'),
  password: Joi.string().required().label('Password'),
});

export const forgotSchema = Joi.object({
  email: Joi.string().trim().email().required().label('Email')
});

export const resetSchema = Joi.object({
  password: Joi.string().min(6).max(72).required().label('Password')
});

export const profileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60).required().label('Name'),
  email: Joi.string().trim().email().required().label('Email'),
  phone: phone().allow('', null).label('Phone'),
});

export const passwordSchema = Joi.object({
  currentPassword: Joi.string().required().label('Current password'),
  newPassword: Joi.string().min(6).max(72).required().label('New password'),
});

export const categorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(40).required().label('Category name'),
  description: Joi.string().trim().allow('').max(200).label('Description'),
});

export const productSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required().label('Cake name'),
  description: Joi.string().allow('').max(1000).label('Description'),
  category: objectId().required().label('Category'),
  image: Joi.string().allow('').max(500).label('Photo'),
  sizes: Joi.array()
    .min(1)
    .items(
      Joi.object({
        label: Joi.string().trim().required().label('Size label'),
        price: Joi.number().positive().required().label('Price')
      })
    )
    .required()
    .label('Sizes'),
  flavours: Joi.array().items(Joi.string().trim().max(40)).label('Flavours'),
  featured: Joi.boolean(),
  inStock: Joi.boolean(),
});

export const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().label('Rating'),
  comment: Joi.string().trim().allow('').min(3).max(500).label('Comment'),
});

export const orderSchema = Joi.object({
  items: Joi.array()
    .min(1)
    .max(30)
    .items(
      Joi.object({
        productId: objectId().required().label('Cake'),
        size: Joi.string().trim().required().label('Size'),
        flavour: Joi.string().trim().allow('').max(60).label('Flavour'),
        message: Joi.string().trim().allow('').max(60).label('Cake message'),
        qty: Joi.number().integer().min(1).max(20).required().label('Quantity'),
      })
    )
    .required()
    .label('Cart'),
  customer: Joi.object({
    name: Joi.string().trim().min(2).max(80).required().label('Name'),
    phone: phone().required().label('Phone'),
    email: Joi.string().trim().email().allow('').label('Email'),
    address: Joi.string().trim().min(5).max(200).required().label('Address'),
    city: Joi.string().trim().min(2).max(60).required().label('City'),
  })
    .required()
    .label('Delivery details'),
  deliveryDate: Joi.date().iso().greater('now').required().label('Delivery date'),
  deliveryNote: Joi.string().allow('').max(300).label('Note'),
  paymentMethod: Joi.string().valid('cod', 'payhere').required().label('Payment method'),
  couponCode: Joi.string().trim().allow('', null).max(20).label('Coupon'),
});
