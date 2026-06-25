const adminRoute = require('./admin/admin.route.js');
console.log('Type:', adminRoute.constructor.name);
console.log('Stack length:', adminRoute.stack.length);
adminRoute.stack.forEach(layer => {
  if (layer.route) {
    console.log('Methods:', Object.keys(layer.route.methods).join(','), 'Path:', layer.route.path);
  } else {
    console.log('Not a route:', layer.name || 'anonymous');
  }
});
