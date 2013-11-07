function mixin(request) {
	Object.defineProperty(request, 'assert', { value: req_assert, enumerable: false });
}

function req_assert(desc) {
	// Acceptable content-type(s)
	if (desc.accept && !local.preferredType(this, desc.accept)) {
		throw 406;
	}
	// Request content-type
	if (desc.type && this.headers['content-type'] != desc.type) {
		throw 415;
	}
	if (desc.body) {
		// Make sure a body exists
		if (!this.body) {
			throw { status: 422, reason: 'bad ent - request body required' };
		}

		// Iterate the given validators and run them on each key
		for (var validatorName in desc.body) {
			// Sanity check
			if (!(validatorName in body_validators)) {
				console.error('Invalid body validator', validatorName, 'Available validators:', Object.keys(body_validators));
				continue;
			}

			// Run validator
			var params = asArray(desc.body[validatorName]);
			body_validators[validatorName](this, params);
		}
	}
}

var body_validators = {
	'string':  mkTypeValidator('string'),
	'number':  mkTypeValidator('number'),
	'boolean': mkTypeValidator('boolean'),
	'object':  mkTypeValidator('object'),
	'notnull': function(req, params) {
		params.forEach(function(param) {
			if (req.body[param] === null) {
				throw { status: 422, reason: 'bad ent - `'+param+'` must not be null' };
			}
		});
	},
	'defined': function(req, params) {
		params.forEach(function(param) {
			if (typeof req.body[param] == 'undefined') {
				throw { status: 422, reason: 'bad ent - `'+param+'` must not be undefined' };
			}
		});
	},
	'truthy': function(req, params) {
		params.forEach(function(param) {
			if (!req.body[param]) {
				throw { status: 422, reason: 'bad ent - `'+param+'` must not be falsey' };
			}
		});
	}
};

function mkTypeValidator(type) {
	return function(req, params) {
		params.forEach(function(param) {
			if (typeof req.body[param] != type) {
				throw { status: 422, reason: 'bad ent - `'+param+'` must be of type "'+type+'"' };
			}
		});
	};
}

function asArray(v) {
	return Array.isArray(v) ? v : [v];
}

module.exports = mixin;