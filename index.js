var PlayerMail = require('./playerMail');

/**
 */

/**
 * 邮件服务对象
 * @param mysqlPool                         数据库连接池句柄
 * @param {object} mailOpts
 * @param {string} mailOpts.database        数据库名
 * @param {string} mailOpts.table           表名
 * @param {string} mailOpts.primaryKey      主键名
 * @param {bool}   mailOpts.autoIncrement   是否主键自增
 * @param {obj}    mailOpts.fields          所有字段
 * @param {string} mailOpts.fields.keys     字段名
 * @param {*}      mailOpts.fields.value    字段默认值
 * @constructor
 */
var MailServer = function(mysqlPool, mailOpts) {
    this.mailMaker = new PlayerMail(mailOpts);
    this.pool = mysqlPool;
};

var PRIMARY_KEY = 'priKey';

module.exports = MailServer;

MailServer.prototype.start = function(cb) {
    cb();
};

MailServer.prototype.stop = function(cb) {
    cb();
};

/**
 * 根据表对象添加数据
 * @param mailInfo
 * @param cb
 */
MailServer.prototype.addMail = function(mailInfo, cb) {
    var data = this.mailMaker.makeInsertSql(mailInfo);
    var sql = data[0], newMail = data[1];
    //console.error(`addSql : ${sql}`);
    this.pool.query(sql, [], (err, data)=>{
        if (!!err) {
            cb(err);
            console.error(err);
            return;
        }
        if (!!data.insertId) {
            var priKey = newMail[PRIMARY_KEY];
            newMail[priKey] = data.insertId;
        }
        delete newMail[PRIMARY_KEY];
        cb(err, newMail);
    });
};

/**
 * 根据条件删除数据
 * @param condition         {string}
 * @param cb
 */
MailServer.prototype.remMail = function(condition, cb) {
    var sql = this.mailMaker.makeDeleteSql(condition);
    //console.error(`remSql : ${sql}`);
    this.pool.query(sql, [], cb);
};

/**
 * 根据表对象更新数据
 * @param mailInfo
 * @param cb
 */
MailServer.prototype.updMail = function(mailInfo, cb) {
    var data = this.mailMaker.makeUpdateSql(mailInfo);
    if (!data) {
        cb(`can not find primary value`);
        console.error(`can not find primary value in mailInfo:${mailInfo}`);
        return;
    }
    var sql = data[0], afterMail = data[1];
    //console.error(`updSql : ${sql}`);
    this.pool.query(sql, [], (err)=>{
        cb(err, afterMail);
    });
};

/**
 * 根据条件获取数据
 * @param condition         {obj|string}
 * @param cb
 */
MailServer.prototype.getMail = function(condition, cb) {
    var sql = this.mailMaker.makeSelectSql(condition);
    //console.error(`getSql : ${sql}`);
    this.pool.query(sql, [], cb);
};