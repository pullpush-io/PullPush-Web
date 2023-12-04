// @ts-expect-error
export default function formVerification(form) {
	const value = Object.fromEntries(form.entries());
	// convert before and after to epoch
	if (value.before) {
		value.before = new Date(value.before).getTime() / 1000;
		if (value.before_time) {
			let [hour, minute] = value.before_time.split(':');
			hour = +hour;
			minute = +minute;
			value.before += hour * 3600 + minute * 60;
		}
	}
	delete value.before_time;
	delete value.before_time_input;
	delete value.before_input;
	if (value.after) {
		value.after = new Date(value.after).getTime() / 1000;
		if (value.after_time) {
			let [hour, minute] = value.after_time.split(':');
			hour = +hour;
			minute = +minute;
			value.after += hour * 3600 + minute * 60;
		}
	}
	delete value.after_time;
	delete value.after_time_input;
	delete value.after_input;

	delete value.timezone;

	if (value.author) {
		value.author = value.author.toLowerCase();
		if (value.author.startsWith('/u/')) {
			value.author = value.author.replace('/u/', '');
		} else if (value.author.startsWith('u/')) {
			value.author = value.author.replace('u/', '');
		}
	}
	if (value.subreddit) {
		if (value.subreddit.startsWith('/r/')) {
			value.subreddit = value.subreddit.replace('/r/', '');
		} else if (value.subreddit.startsWith('r/')) {
			value.subreddit = value.subreddit.replace('r/', '');
		}
	}
	// convert checkboxes to bools
	for (const key in value) {
		if (value[key] === 'on') {
			value[key] = true;
		}
	}
	// convert empty strings to null
	for (const key in value) {
		if (value[key] === '') {
			delete value[key];
		}
	}
	//combine num_comments and num_comments_comparator
	if (value.num_comments && value.num_comments_comparator) {
		value.num_comments = `${value.num_comments_comparator}${value.num_comments}`;
	}
	//combine score and score_comparator
	if (value.score && value.score_comparator) {
		value.score = `${value.score_comparator}${value.score}`;
	}
	//remove score_comparator and num_comments_comparator
	delete value.score_comparator;
	delete value.num_comments_comparator;
	// delete value.type;
	return value;
}
