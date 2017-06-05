/* Magic Mirror Config Sample
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var config = {
	port: 8080,
	ipWhitelist: [], // Set [] to allow all IP addresses.

	language: "en",
	timeFormat: 24,
	units: "metric",

	modules: [
		{
			module: "alert",
		},
		{
			module: "updatenotification",
			position: "top_bar"
		},
		{
			module: "clock",
			position: "top_left"
		},
		{
			module: "calendar",
			header: "日历",
			position: "top_left",
			config: {
				calendars: [
					{
						symbol: "calendar-check-o ",
						url: "https://calendar.google.com/calendar/ical/deanzh16%40gmail.com/private-1500ba3117ff42e02e02530eb5d291da/basic.ics"
					}
				]
			}
		},
		// {
		// 	module: "compliments",
		// 	position: "lower_third"
		// },
		{
			module: "currentweather",
			position: "top_right",
			config: {
				location: "上海",
				locationID: "1796236",  //ID from http://www.openweathermap.org/help/city_list.txt
				appid: "42c6eeb7f2869ef2d9401062e9af1619"
			}
		},
		{
			module: "weatherforecast",
			position: "top_right",
			header: "Weather Forecast",
			config: {
				location: "上海",
				locationID: "1796236",  //ID from http://www.openweathermap.org/help/city_list.txt
				appid: "42c6eeb7f2869ef2d9401062e9af1619"
			},
		},
		{
			module: "newsfeed",
			position: "bottom_bar",
			config: {
				feeds: [
					{
						title: "教务处",
						url: "http://www.jwc.sjtu.edu.cn/rss/rss_notice.aspx?SubjectID=198015&TemplateID=221009",
						encoding: "gb2312"
					},
					{
						title: "文体活动",
						url: "http://www.sjtu.edu.cn/system/resource/code/rss/rssfeed.jsp?type=list&viewid=50753&mode=10&dbname=vsb&owner=965815885&ownername=wwwsjtu2013&contentid=33773&number=20",
					},
					
				],
				showSourceTitle: true,
				showPublishDate: true
			}
		},
		{
			module: "newsfeed",
			position: "bottom_bar",
			config: {
				feeds: [
					{
						title: "百度新闻",
						url: "http://news.baidu.com/n?cmd=1&class=technnews&tn=rss"
					}
				],
				showSourceTitle: true,
				showPublishDate: true,
				ignoreOldItems: true
			}
		},
	]

};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}
