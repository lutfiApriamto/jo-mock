const isStaticPath = (path) => !path.includes(':');

const patternToRegex = (pattern) => {
  const escaped  = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const regexStr = escaped.replace(/:([^/]+)/g, '([^/]+)');
  return new RegExp(`^${regexStr}$`);
};

const pathsMatch = (incomingPath, endpointPath) => {
  if (isStaticPath(endpointPath)) {
    return incomingPath === endpointPath;
  }
  return patternToRegex(endpointPath).test(incomingPath);
};

export const findMatchingEndpoint = (incomingPath, endpoints) => {
  const staticMatch = endpoints.find(
    (ep) => isStaticPath(ep.path) && ep.path === incomingPath
  );

  if (staticMatch) return staticMatch;

  return endpoints.find(
    (ep) => !isStaticPath(ep.path) && pathsMatch(incomingPath, ep.path)
  ) || null;
};

