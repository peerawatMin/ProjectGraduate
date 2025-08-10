// next.config.js หรือ next.config.ts
const nextConfig = {
  reactStrictMode: true,

  webpack(config: { module: { rules: { test: RegExp; use: { loader: string; options: { publicPath: string; outputPath: string; name: string; esModule: boolean; }; }; }[]; }; }, { isServer }: unknown) {
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|swf|ogv)$/,
      use: {
        loader: "file-loader",
        options: {
          publicPath: `/_next/static/videos/`,
          outputPath: `${isServer ? "../" : ""}static/videos/`,
          name: "[name].[hash].[ext]",
          esModule: false,
        },
      },
    });

    return config;
  },
};

export default nextConfig;
