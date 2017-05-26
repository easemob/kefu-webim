// 以下调用会缓存参数
// getVisitorId
// getProjectId
// getToken
// getGroupId

easemobim.apiHelper = (function (_const, utils, api, emajax) {
	var config;
	var cache = {};

	function getCurrentServiceSession(){
		return new Promise(function(resolve, reject){
			api('getCurrentServiceSession', {
				tenantId: config.tenantId,
				orgName: config.orgName,
				appName: config.appName,
				imServiceNumber: config.toUser,
				id: config.user.username
			}, function (msg) {
				resolve(msg.data);
			}, function (err){
				reject(err);
			});
		});
	}

	function getSessionQueueId(){
		return new Promise(function(resolve, reject){
			api('getSessionQueueId', {
				tenantId: config.tenantId,
				visitorUsername: config.user.username,
				techChannelInfo: config.orgName + '%23' + config.appName + '%23' + config.toUser
			}, function (msg) {
				resolve(msg.data);
			}, function(err){
				reject(err);
			});
		});
	}

	function getToken(){
		return new Promise(function(resolve, reject){
			var token = config.user.token;
			if (token){
				resolve(token);
			}
			else {
				emajax({
					url: location.protocol + '//' + config.restServer + '/' + config.orgName +
						'/' + config.appName + '/token',
					dataType: 'json',
					data: {
						grant_type: 'password',
						username: config.user.username,
						password: config.user.password
					},
					type: 'POST',
					success: function(resp){
						var token = resp.access_token;

						// cache token
						config.user.token = token;
						resolve(token);
					},
					error: function(err){
						reject(err);
					}
				});
			}
		});
	}
	function getNotice(){
		return new Promise(function(resolve, reject){
			if (config.isWebChannelConfig){
				resolve(config.notice);
			}
			else {
				api('getSlogan', {
					tenantId: config.tenantId
				}, function (msg) {
					var content = utils.getDataByPath(msg, 'data.0.optionValue');
					var notice = {
						enabled: !!content,
						content: content
					};
					resolve(notice);
				}, function(err){
					reject(err);
				});
			}
		});
	}	
	function getTheme(){
		return new Promise(function(resolve, reject){
			if (config.isWebChannelConfig){
				resolve(config.themeName);
			}
			else {
				api('getTheme', {
					tenantId: config.tenantId
				}, function (msg) {
					var themeName = utils.getDataByPath(msg, 'data.0.optionValue');
					resolve(themeName);
				}, function(err){
					reject(err);
				});
			}
		});
	}
	function getConfig(configId){
		return new Promise(function(resolve, reject){
			api('getConfig', {
				configId: configId
			}, function (msg) {
				var configJson = utils.getDataByPath(msg, 'data.entity.configJson');
				resolve(configJson);
			}, function(err){
				reject(err);
			});

			
		});
	}
	function getProjectId(){
		return new Promise(function(resolve, reject){
			if (cache.projectId){
				resolve(cache.projectId);
			}
			else {
				getToken().then(function(token){
					api('getProject', {
						tenantId: config.tenantId,
						'easemob-target-username': config.toUser,
						'easemob-appkey': config.appKey.replace('#', '%23'),
						'easemob-username': config.user.username,
						headers: { Authorization: 'Easemob IM ' + token }
					}, function (msg) {
						var projectId = utils.getDataByPath(msg, 'data.entities.0.id');
						if (projectId){
							// cache projectId
							cache.projectId = projectId;
							resolve(projectId);
						}
						else {
							reject('no project id exist.');
						}
					}, function(err){
						reject(err);
					});
				});
			}
		});
	}

	function createTicket(opt){
		var data = opt.data;

		return new Promise(function(resolve, reject){
			easemobim.api('createTicket', {
				tenantId: config.tenantId,
				'easemob-target-username': config.toUser,
				'easemob-appkey': config.appKey.replace('#', '%23'),
				'easemob-username': config.user.username,
				origin_type: 'webim',
				headers: { Authorization: 'Easemob IM ' + opt.token },
				projectId: opt.projectId,
				subject: '',
				content: opt.content,
				status_id: '',
				priority_id: '',
				category_id: '',
				creator: {
					name: opt.name,
					avatar: '',
					email: opt.mail,
					phone: opt.phone,
					qq: '',
					company: '',
					description: ''
				},
				attachments: null
			}, function (msg) {
				isSending = false;
				if (utils.getDataByPath(msg, 'data.id')) {
					resolve();
				}
				else {
					reject('unknown errow.');
				}
			}, function(err){
				reject(err);
			});
		});
	}

	function getVisitorId(){
		return new Promise(function(resolve, reject){
			if (cache.visitorId){
				resolve(cache.visitorId);
			}
			else {
				getToken().then(function(token){
					api('getVisitorInfo', {
						tenantId: config.tenantId,
						orgName: config.orgName,
						appName: config.appName,
						userName: config.user.username,
						imServiceNumber: config.toUser,
						token: token
					}, function (msg) {
						var visitorId = utils.getDataByPath(msg, 'data.entity.userId');
						if (visitorId){
							// cache visitor id
							cache.visitorId = visitorId;
							resolve(visitorId);
						}
						else {
							reject('visitor id is not exist.');
						}
					}, function(err){
						reject(err);
					});
				});
			}
		});
	}

	function getOfficalAccounts(){
		return new Promise(function(resolve, reject){
			Promise.all([
				getVisitorId(),
				getToken()
			]).then(function(result){
				var visitorId = result[0];
				var token = result[1];

				api('getOfficalAccounts', {
					tenantId: config.tenantId,
					orgName: config.orgName,
					appName: config.appName,
					userName: config.user.username,
					visitorId: visitorId,
					token: token
				}, function (msg) {
					var list = utils.getDataByPath(msg, 'data.entities');
					if (_.isArray(list)){
						resolve(list);
					}
					else {
						reject('unexpect data format.');
					}
				}, function(err){
					reject(err);
				});
			});
		});
	}

	function getOfficalAccountMessage(officialAccountId, startId){
		return new Promise(function(resolve, reject){
			Promise.all([
				getVisitorId(),
				getToken()
			]).then(function(result){
				var visitorId = result[0];
				var token = result[1];

				api('getOfficalAccountMessage', {
					tenantId: config.tenantId,
					orgName: config.orgName,
					appName: config.appName,
					userName: config.user.username,
					token: token,
					visitorId: visitorId,
					officialAccountId: officialAccountId,
					direction: 'before',
					size: _const.GET_HISTORY_MESSAGE_COUNT_EACH_TIME,
					startId: startId
				}, function (msg) {
					var list = utils.getDataByPath(msg, 'data.entities');
					if (_.isArray(list)){
						resolve(list);
					}
					else {
						reject('unexpect data format.');
					}
				}, function(err){
					reject(err);
				});
			})
			['catch'](function(err){
				reject(err);
			});
		});
	}

	// 获取上下班状态，false 代表上班，true 代表下班
	function getDutyStatus(){
		return new Promise(function(resolve, reject){
			api('getDutyStatus_2', {
				channelType: 'easemob',
				originType: 'webim',
				channelId: config.channelId,
				tenantId: config.tenantId,
				queueName: config.emgroup,
				agentUsername: config.agentName
			}, function (msg) {
				resolve(!utils.getDataByPath(msg, 'data.entity'));
			}, function (err) {
				console.error('unable to get duty state: ', err);
				// 获取状态失败则置为上班状态
				resolve(true);
			});
		});
	}

	function getGrayList(){
		return new Promise(function (resolve, reject) {
			api('graylist', {}, function (msg) {
				var grayList = {};
				var data = msg.data || {};
				_.each(_const.GRAY_LIST_KEYS, function (key) {
					grayList[key] = _.contains(data[key], +config.tenantId);
				});
				resolve(grayList);
			}, function (err) {
				console.error('unable to get gray list: ', err);
				// 获取失败返回空对象
				resolve({});
			});
		});
	}

	function getRobertGreeting(){
		return new Promise(function (resolve, reject) {
			api('getRobertGreeting_2', {
				channelType: 'easemob',
				originType: 'webim',
				channelId: config.channelId,
				tenantId: config.tenantId,
				agentUsername: config.agentName,
				queueName: config.emgroup
			}, function (msg) {
				resolve(msg.data.entity || {});
			}, function (err) {
				reject(err);
			});
		});
	}

	function getRobertIsOpen(){
		return new Promise(function (resolve, reject) {
			api('getRobertIsOpen', {
				channelType: 'easemob',
				originType: 'webim',
				channelId: config.channelId,
				tenantId: config.tenantId,
				agentUsername: config.agentName,
				queueName: config.emgroup
			}, function (msg) {
				resolve(msg.data.entity);
			}, function (err) {
				reject(err);
			});
		});
	}

	function getSystemGreeting(){
		return new Promise(function (resolve, reject) {
			api('getSystemGreeting', {
				tenantId: config.tenantId
			}, function (msg) {
				resolve(msg.data);
			}, function (err) {
				reject(err);
			});
		});
	}

	function getGroupId(){
		return new Promise(function(resolve, reject){
			if (cache.groupId){
				resolve(cache.groupId);
			}
			else {
				api('getGroupNew', {
					id: config.user.username,
					orgName: config.orgName,
					appName: config.appName,
					imServiceNumber: config.toUser,
					tenantId: config.tenantId
				}, function (msg) {
					var groupId = msg.data;

					if (groupId){
						cache.groupId = groupId;
						resolve(groupId);
					}
					else {
						reject('unable to get group id.');
					}
				}, function (err){
					reject(err);
				});
			}
		});
	}

	function getHistory(msgSeqId){
		return new Promise(function(resolve, reject){
			getGroupId().then(function(groupId){
				api('getHistory', {
					fromSeqId: msgSeqId,
					size: _const.GET_HISTORY_MESSAGE_COUNT_EACH_TIME,
					chatGroupId: groupId,
					tenantId: config.tenantId
				}, function (msg) {
					resolve(msg.data || []);
				}, function(err){
					reject(err);
				});
			});
		});
	}

	function getExSession(){
		return new Promise(function(resolve, reject){
			api('getExSession', {
				id: config.user.username,
				orgName: config.orgName,
				appName: config.appName,
				imServiceNumber: config.toUser,
				tenantId: config.tenantId
			}, function (msg){
				resolve(msg.data || {});
			}, function (err){
				reject(err);
			});
		});
	}

	function getAgentStatus(agentUserId){
		return new Promise(function(resolve, reject){
			api('getAgentStatus', {
				tenantId: config.tenantId,
				orgName: config.orgName,
				appName: config.appName,
				agentUserId: agentUserId,
				userName: config.user.username,
				token: config.user.token,
				imServiceNumber: config.toUser
			}, function (msg) {
				resolve(utils.getDataByPath(msg, 'data.state'));
			}, function (err){
				reject(err);
			});
		});
	}

	return {
		getCurrentServiceSession: getCurrentServiceSession,
		getSessionQueueId: getSessionQueueId,
		getToken: getToken,
		getNotice: getNotice,
		getTheme: getTheme,
		getConfig: getConfig,
		getProjectId: getProjectId,
		createTicket: createTicket,
		getVisitorId: getVisitorId,
		getOfficalAccounts: getOfficalAccounts,
		getOfficalAccountMessage: getOfficalAccountMessage,
		getDutyStatus: getDutyStatus,
		getGrayList: getGrayList,
		getRobertGreeting: getRobertGreeting,
		getSystemGreeting: getSystemGreeting,
		getHistory: getHistory,
		getExSession: getExSession,
		getAgentStatus: getAgentStatus,
		setCacheItem: function(key, value){
			cache[key] = value;
		},
		clearCacheItem: function(key){
			cache[key] = void 0;
		},
		init: function(cfg){
			config = cfg;
		}
	};
}(easemobim._const, easemobim.utils, easemobim.api, easemobim.emajax));
