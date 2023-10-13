var express = require('express');
var router = express.Router();
const Data = require('../models/Question_Model');
const Swal = require('sweetalert2');


// Ruta principal - Muestra el formulario de registro
router.get('/', async (req, res) => {
  try {
    res.render('index');
  } catch (error) {
    // Manejar errores en caso de que ocurran durante la operación de carga
    console.log(error)
    res.status(500).send('Ocurrió un error durante la carga');
  }
});


router.post('/submit', async (req, res) => {
  try {
    const { name, email, date } = req.body;
    const answers = [];
    // console.log(date.getDate())
    // Recorrer las respuestas del formulario y almacenarlas en el formato deseado
    for (let i = 1; i <= 15; i++) {
      const question = `Question ${i}`;
      const answer = parseInt(req.body[`answer${i}`]);
      answers.push({ question, answer });
    }
    // console.log(determinarSignoZodiacal(date))
    // const signo =  determinarSignoZodiacal(date);

    const user = new Data({ name, email, answers });
  
    await user.save();
    res.redirect('/')
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).send('Server error');
  }
});



// // Ruta de éxito - Muestra el signo zodiacal del usuario registrado
router.get('/success', async (req, res) => {
  try {
    const users = await Data.find();

    res.render('success', { users: users });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
});


const ExcelJS = require('exceljs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


// router.get('/download/csv', async (req, res) => {
//   try {
//     const users = await Data.find(); // Obtener todos los usuarios de la base de datos
//     // Obtener la fecha actual para incluirla en el nombre del archivo CSV

//     // Configurar el encabezado de respuesta para descargar el archivo CSV
//     res.setHeader('Content-Type', 'text/csv');
//     res.setHeader(
//       'Content-Disposition',
//       'attachment; filename="' + encodeURIComponent('users.csv') + '"'
//     );
//     // Crear el escritor CSV y escribir los datos en el archivo CSV
//     const csvWriter = createCsvWriter({
//       path: 'users.csv',
//       header: [
//         { id: 'name', title: 'Nombre' },
//         { id: 'date', title: 'FechaNac' },
//         { id: 'answer1', title: 'Answer 1' },
//         { id: 'answer2', title: 'Answer 2' },
//         { id: 'answer3', title: 'Answer 3' },
//         { id: 'answer4', title: 'Answer 4' },
//         { id: 'answer5', title: 'Answer 5' },
//         { id: 'answer6', title: 'Answer 6' },
//         { id: 'answer7', title: 'Answer 7' },
//         { id: 'answer8', title: 'Answer 8' },
//         { id: 'answer9', title: 'Answer 9' },
//         { id: 'answer10', title: 'Answer 10' },
//         { id: 'answer11', title: 'Answer 11' },
//         { id: 'answer12', title: 'Answer 12' },
//         { id: 'answer13', title: 'Answer 13' },
//         { id: 'answer14', title: 'Answer 14' },
//         { id: 'answer15', title: 'Answer 15' },
//         // Agrega aquí las preguntas restantes
//       ],
//     });

//     // Escribir los datos en el archivo CSV
//     const csvRecords = [];
//     users.forEach(user => {
//       const csvRecord = {
//         name: user.name
//       };

//       csvRecord.date = user.date;

//       user.answers.forEach((answer, index) => {
//         csvRecord[`answer${index + 1}`] = answer.answer;
//       });

//       csvRecords.push(csvRecord);
//     });

//     await csvWriter.writeRecords(csvRecords);
//     res.download('users.csv');
//   } catch (error) {
//     console.error('Error generating CSV file:', error);
//     res.status(500).send('Server error');
//   }
// });

// Ruta para descargar el archivo CSV
router.get('/download/csv', async (req, res) => {
  try {
    const users = await Data.find(); // Obtener todos los usuarios de la base de datos

    // Crear el contenido del archivo CSV
    const csvData = [];

    // Agregar encabezados
    csvData.push(['Name', 'Email', 'Rasgo_comunicativo', 'Rasgo_apacionado', 'Rasgo_temperamental', 'Rasgo_aprendizaje']);

    // Agregar los datos de los usuarios
    users.forEach(user => {
      const userData = [user.name,user.email];

              // Crear un objeto para agrupar las respuestas por valor (1, 2, 3, 4, 5 o 6)
              const groupedAnswers = {
                1: 0,
                2: 0,
                3: 0,
                4: 0
              };      

      user.answers.forEach(answer => {
        const answerValue = answer.answer;
        if (groupedAnswers.hasOwnProperty(answerValue)) {
          groupedAnswers[answerValue]++;
        }
      });
      userData.push(groupedAnswers[1], groupedAnswers[2], groupedAnswers[3], groupedAnswers[4]);
      csvData.push(userData);
    });

    // Configurar el encabezado de respuesta para descargar el archivo CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' + encodeURIComponent('users.csv') + '"'
    );

    // Convertir los datos del CSV a una cadena
    const csvString = csvData.map(row => row.join(',')).join('\n');

    // Enviar la cadena CSV al cliente
    res.send(csvString);
  } catch (error) {
    console.error('Error generating CSV file:', error);
    res.status(500).send('Server error');
  }
});


module.exports = router;
