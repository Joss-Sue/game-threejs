import mongoose from 'mongoose'

async function conectarDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/game', {
    })
    console.log('✅ Conectado a MongoDB')
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err)
  }
}

export default conectarDB