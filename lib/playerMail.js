var util = require('util');
/**
 * 私人邮件数据结构
 * @param {obj}    opts                 所有配置
 *
 * @param {string} opts.database        数据库名
 * @param {string} opts.table           表名
 * @param {string} opts.primaryKey      主键名
 * @param {bool}   opts.autoIncrement   是否主键自增
 *
 * @param {obj}    opts.fields          所有字段
 * @param {string} opts.fields.keys     字段名
 * @param {*}      opts.fields.value    字段默认值
 * @constructor
 */
var PlayerMail = function(opts) {
    this.database = opts.database;
    this.table = opts.name;
    this.primaryKey = opts.primaryKey || 'id';
    this.autoIncrement = opts.autoIncrement || false;
    this.fields = opts.fields || {};
};

var PRIMARY_KEY = 'priKey';

module.exports = PlayerMail;

/**
 * 构建插入语句
 * @param args
 * @returns {Array} Array[0] sql, Array[1] newMail
 */
PlayerMail.prototype.makeInsertSql = function(args) {
    var newMail = {};
    newMail[PRIMARY_KEY] = this.primaryKey;
    var keys = '', values = '';
    for (let field in this.fields) {
        if (!this.fields.hasOwnProperty(field) || typeof field != 'string')
            continue;
        var value = args[field] || this.fields[field];
        newMail[field] = value;
        if (this.autoIncrement && this.primaryKey == field)
            continue;
        if (isNaN(value)) value = util.format('"%s"', value);
        keys += util.format('`%s`,', field);
        values += util.format('%s,', value);
    }
    keys = keys.substring(0, keys.length - 1);
    values = values.substring(0, values.length - 1);
    var sql = util.format('insert into `%s` (%s) values (%s)', this.table, keys, values);
    return [sql, newMail];
};

/**
 * 构建删除语句,条件仅支持and
 * @param {string} condition
 * @returns {string}
 */
PlayerMail.prototype.makeDeleteSql = function(condition) {
    if (!condition || typeof condition != 'string')
        return null;
    else
        return util.format('delete from `%s` where %s', this.table, condition);
};

/**
 * 构建更新语句
 * @param args
 * @returns {Array} Array[0] sql, Array[1] afterMail
 */
PlayerMail.prototype.makeUpdateSql = function(args) {
    var afterMail = {};
    var priValue = args[this.primaryKey];
    if (!priValue)
        return null;
    var values = '';
    for (let field in this.fields) {
        if (!this.fields.hasOwnProperty(field) || typeof field != 'string')
            continue;
        var value = args[field] || this.fields[field];
        afterMail[field] = value;
        if (this.autoIncrement && this.primaryKey == field)
            continue;
        if (isNaN(value)) value = util.format('"%s"', value);
        values += util.format(' `%s` =', field);
        values += util.format(' %s,', value);
    }
    values = values.substring(0, values.length - 1);
    var sql = util.format('update `%s` set %s where `%s` = ', this.table, values, this.primaryKey, priValue);
    return [sql, afterMail];
};

/**
 * 构建查询语句
 * @param {string} condition
 * @returns {string}
 */
PlayerMail.prototype.makeSelectSql = function(condition) {
    if (!condition || typeof condition != 'string')
        return null;
    else
        return util.format('select * from `%s` where %s', this.table, condition);
};