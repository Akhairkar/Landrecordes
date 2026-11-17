/**
 * Static asset Worker entry point.
 * All page files, styles, scripts and images are served from the built dist/ assets.
 */
export default {
  fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
