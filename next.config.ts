import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // nodemailer uses Node.js-native features and dynamic requires — opt it out of
  // Next's server bundling so it's loaded via native `require` at runtime.
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
