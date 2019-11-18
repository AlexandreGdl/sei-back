let mongoose = require('mongoose');
let Schema = mongoose.Schema;

var UserRight = new Schema({
    table_id: {type: String},
    data: {type: Object}
}, {
    collection: 'userRights'
});

export default mongoose.model('UserRightSchema', UserRight);