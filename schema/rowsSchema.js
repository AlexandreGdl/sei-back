import mongoose, { Schema } from 'mongoose'

const RowSchema = new Schema(
    {
        data: {type: Object},
        table_id: {type: String}
    },{
        collection: 'rows'
    }
)

export default mongoose.model('RowSchema', RowSchema)