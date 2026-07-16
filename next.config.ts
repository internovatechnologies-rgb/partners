import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // nodemailer uses Node.js-native features and dynamic requires — opt it out of
  // Next's server bundling so it's loaded via native `require` at runtime.
  serverExternalPackages: ["nodemailer"],

  // The partner program page is now the site root; keep the old /partners URL
  // working by permanently redirecting it to /.
  async redirects() {
    return [{ source: "/partners", destination: "/", permanent: true }];
  },
};

export default nextConfig;
