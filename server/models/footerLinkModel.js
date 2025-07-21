import mongoose from 'mongoose';

const footerLinkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const FooterLink = mongoose.model('FooterLink', footerLinkSchema);
export default FooterLink;