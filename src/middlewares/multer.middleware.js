import multer from 'multer'

const storage = multer.diskStorage({
    // cb means callback
    destination: function(req, file, cb){
        cb(null, './public/temp') // folder where the files will be stored temporarily
    },
    filename: function(req, file, cb) {
        //TODO:  make sure that there are no duplicates in filenames (if any user uploads 5 fils with same name than all previous files will be overwritten )
        cb(null,`${Date.now()}_${file.originalname}`)  // The image name is used as the original name by user
    }
})

export const upload = multer({storage:storage});