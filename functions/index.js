/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { initializeApp } = require ("firebase-admin/app");
const { Firestore, getFirestore, Timestamp } = require("firebase-admin/firestore"); 
const { onDocumentCreated, onDocumentDeleted } = require("firebase-functions/v2/firestore");
const { event } = require("firebase-functions/v1/analytics");


initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

 exports.helloWorld = onRequest((request, response) => {
    logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from Firebase!");
 });

exports.anyadirMensajeCGuemes = onRequest(async (request, response) => {
    const titulo = request.query.titulo;
    const cuerpo = request.query.cuerpo;


    const anyadeMensaje = await getFirestore()
        .collection("mensajes")
        .add({titulo: titulo, cuerpo: cuerpo});

    const idMensaje = anyadeMensaje.id;

    response.json({result: ` Mensaje añadido con ID: ${idMensaje}`});
 });


 //Hay que pasar el ID del menssaje por parametro en la URL
 exports.eliminarMensajeCGuemes = onRequest(async (request, response) => {
    const id = request.query.id;

    const referenciaMensaje = await getFirestore()
        .collection("mensajes")
        .doc(id);

    const mensajeDoc = await referenciaMensaje.get();
    const existe = mensajeDoc.exists;
    if (!existe) {
        response.status(404).json({ error: "Mensaje no encontrado." });
        return;
    }

    else{
        await referenciaMensaje.delete();
        response.json({result: `Mensaje con ID ${id} eliminado correctamente`});
    }

 });

 exports.listarMensajesCGuemes = onRequest(async (request, response) => {

    const arrayMensajes = [];
    var i = 0;

    const listaMensajes = await getFirestore()
        .collection("mensajes")
        .get();

        listaMensajes.forEach(doc => {
            arrayMensajes[i] = ` Mensaje ${(i+1)}  ->   Titulo: ` + 
            doc.data().titulo + `, Cuerpo: ` + doc.data().cuerpo;
            i++;
        });

    response.json({result: ` Mensajes en la base de datos: ${arrayMensajes}`});
 });


 exports.anyadirFechaMensajeCGuemes = onDocumentCreated("mensajes/{id}", (event) => {

    const titulo = event.data.data().titulo;
    const cuerpo = event.data.data().cuerpo;

    const fecha = Timestamp.now();


    return event.data.ref.set({
        titulo: titulo,
        cuerpo: cuerpo,
        fecha: fecha
    }, {merge: true});

 });


exports.anyadirFechaBorradoMensajeCGuemes = onDocumentDeleted("mensajes/{id}", (event) => {

    const titulo = event.data.data().titulo;
    const cuerpo = event.data.data().cuerpo;

    const fecha = Timestamp.now();


    // Obtener la referencia al documento borrado
    const documentoBorradoRef = event.data.ref;

    // Obtener el ID del documento borrado
    const idDocumentoBorrado = documentoBorradoRef.id;

    // Crear una referencia para el nuevo documento en la carpeta "Archivo"
    const nuevoDocumentoRef = documentoBorradoRef.firestore.collection("Archivo").doc(idDocumentoBorrado);

    // Guardar los datos en el nuevo documento en la carpeta "Archivo"
    return nuevoDocumentoRef.set({
        titulo: titulo,
        cuerpo: cuerpo,
        fecha: fecha
    }, {merge: true});

 });
