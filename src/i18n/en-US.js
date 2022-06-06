module.exports = {
	config: {
		message_timestamp_format: "MMM D HH:mm",
		article_timestamp_format: "MMM D",
		language: "en-US",
		transfer_to_kefu_words: "Chat with agent",
		scheduler_role_nickname: "Scheduler",
	},
	common: {
		confirm: "Confirm",
		cancel: "Cancel",
		contact_agent: "Contact us",
		ticket: "Note",
		submit: "Submit",
		agent: "Agent",
		visitor: "Visitor",
		close: "Close",
		reply: "Reply",
		tip: "Tips",
		send_failed: "Failed to send",
		loading: "loading...",
		no_more_msg: "no more messages",
		press_save_img: "Press to save the picture",
		session_over_limit: "All agents are busy now. Please try again later…",
		faq: "FAQs",
		consult_agent: "Consult agent"
	},
	chat: {
		agent_is_typing: "Agent is typing...",
		current_queue_number: "Customers queuing: ",
		connecting: "Connecting...",
		send: "Send",
		input_placeholder: "Type your message here",
		click_to_ticket: "Note",
		evaluate_agent_title: "Please rate my service",
		click_to_evaluate: "Rate",
		allready_evaluate: "Allready rate",
		paste_image_submit: "Send",
		read_full_version: "Read all",
		default_emoji: "default",
	},
	message_brief: {
		link: "[Link]",
		menu: "[Menu]",
		file: "[File]",
		picture: "[Image]",
		emoji: "[Emoticon]",
		unknown: "[Unknown]",
		video: "[Video]",
	},
	agent_status: {
		online: "(Online)",
		busy: "(Busy)",
		leave: "(Away)",
		hidden: "(Invisible)",
		offline: "(Offline)",
	},
	event_message: {
		no_agent_online: "Agent is offline",
		// no_agent_online: "Agent is offline. Please leave your contact info.",
		session_created: "Conversation is created",
		session_opened: "Conversation is opened",
		sessing_transfering: "Transferring. Please wait...",
		session_transfered: "Conversation is transferred",
		sessing_closed: "Conversation is closed",
	},
	evaluation: {
		rate_my_service: "Rate my service",
		rate_my_evalute: "Has your problem been resolved?",
		review: "Review",
		select_level_please: "Select a star",
		select_tag_please: "Select a label",
		submit_success: "Submit successfully",
		resolved: "Resolved",
		unsolved: "Unsolved",
	},
	ticket: {
		title: "Please fill in your contact info.",
		name: "Name",
		phone_number: "Phone",
		email: "Email",
		content_placeholder: "Type your note here",
		is_sending: "Submiting note...",
		invalid_name_no: "Please enter your name",
		invalid_content_no: "Please enter the message content",
		invalid_name: "Name is incorrect",
		invalid_phone: "Phone number is incorrect",
		invalid_email: "Email address is incorrect",
		invalid_content: "Note cannot be empty. Up to 1500 characters are supported.",
		send_success: "Note sent successfully",
		send_failed_retry: "Failed to submit the note. Please try again later.",
		send_failed_invalid_token: "Failed to submit the note due to invalid token.",
	},
	video: {
		waiting: "Waiting",
		me: "Me",
		video_ended: "Video call ended",
		confirm_prompt: "Invite the agent to a video call? Send the invite and wait for the agent to join the video call.",
		invite_agent_video: "Invite the agent to a video call",
		// 这个文案待确认
		connecting: "Recording",
		waiting_confirm: "Video call request. Waiting for your confirmation",
		can_not_connected: "Video call can’t be connected. Please try again.",
		can_not_open_camera: "Can’t open camera.",
	},
	toolbar: {
		emoji: "Emoticon",
		picture: "Image",
		// fangda: "Amplify",
		// suoxiao: "Reduce",
		fangda: "Big Character",
		suoxiao: "Conventional",
		attachment: "File",
		ticket: "Note",
		video_invite: "Video call",
		evaluate_agent: "Satisfaction",
		transfer_to_kefu: "Chat with agent",
		send_video: "SendVideo",
	},
	prompt: {
		new_message_title_notice: "New message",
		no_valid_channel: "There is no channel account.",
		new_message: "New message",
		too_many_words: "Message too long",
		default_off_duty_word: "We are currently offline.",
		_10_mb_file_limit: "The file size cannot exceed 10 MB.",
	},
};
