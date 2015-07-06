'use strict';

var	inherits = require('util').inherits,
	Steppy = require('twostep').Steppy,
	_ = require('underscore'),
	nodemailer = require('nodemailer');


exports.register = function(app) {
	var BaseNotifier = app.lib.notifier.BaseNotifier;

	function Notifier() {
		BaseNotifier.call(this);
	}

	inherits(Notifier, BaseNotifier);

	Notifier.prototype.init = function(params, callback) {
		this.transport = nodemailer.createTransport(params);
		callback();
	};

	Notifier.prototype._subjectTemplate = _(
		'<%= build.project.name %> build #<%= build.number %> ' +
		'is <%= build.status %>'
	).template();

	Notifier.prototype._bodyTemplate = _(
		'<%= build.project.name %> build #<%= build.number %> status: ' +
		'<%= build.status %><br>' +
		'Current revision is: ' +
		'<%= build.scm.rev.author %>: <%= build.scm.rev.comment %>'
	).template();

	Notifier.prototype.send = function(params, callback) {
		var self = this,
			build = params.build;

		Steppy(
			function() {
				var subject = self._subjectTemplate(params),
					body = self._bodyTemplate(params);

				self.transport.sendMail({
					subject: subject,
					html: body,
					to: params.build.project.notify.to.mail.join(',')
				}, this.slot());
			},
			callback
		);
	};

	app.lib.notifier.register('mail', Notifier);
};
