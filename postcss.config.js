module.exports = {
	plugins: {
		'autoprefixer': {
			browsers: ['ie >= 8', 'ff >= 10', 'Chrome >= 15', 'iOS >= 7',
				'Android >= 4.4.4']
		},
		'cssnano': {
			discardComments: {
				removeAll: true,
			},
			mergeRules: false,
			zindex: false,
			reduceIdents: false,
		}
	},
};
