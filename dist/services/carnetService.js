import * as QRCode from 'qrcode';
import puppeteer from 'puppeteer';
import { PrismaClient } from '../../generated/prisma/index.js';
const prisma = new PrismaClient();
export class CarnetService {
    /**
     * Obtiene los datos del estudiante para el carnet
     */
    async obtenerDatosEstudiante(estudianteId) {
        try {
            const estudiante = await prisma.estudiantes.findUnique({
                where: { id: estudianteId },
                include: {
                    secciones: {
                        select: {
                            nombre: true
                        }
                    },
                    grados: {
                        select: {
                            nombre: true,
                            nivel: true
                        }
                    }
                }
            });
            if (!estudiante) {
                return null;
            }
            return {
                codigo_estudiante: estudiante.codigo_estudiante,
                nombre: estudiante.nombres,
                apellido: estudiante.apellidos,
                grado: estudiante.grados.nombre, // Solo el nombre del grado que ya incluye el nivel
                seccion: estudiante.secciones.nombre,
                turno: estudiante.turno
            };
        }
        catch (error) {
            console.error('Error al obtener datos del estudiante:', error);
            throw new Error('Error al obtener datos del estudiante');
        }
    }
    /**
     * Genera el código QR con los datos del estudiante
     */
    async generarQR(datosEstudiante) {
        try {
            const qrData = JSON.stringify(datosEstudiante);
            const qrCodeDataURL = await QRCode.toDataURL(qrData, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            return qrCodeDataURL;
        }
        catch (error) {
            console.error('Error al generar QR:', error);
            throw new Error('Error al generar código QR');
        }
    }
    /**
     * Genera el HTML del carnet
     */
    generarHTMLCarnet(datosEstudiante, qrCodeDataURL) {
        return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Carnet de Estudiante - IEP 70565</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #f0f2f5;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            
            .carnet {
                width: 480px;
                min-height: 340px; // ✅ Cambiar height fijo por min-height
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%);
                border-radius: 20px;
                padding: 0;
                box-shadow: 0 20px 40px rgba(30, 58, 138, 0.3);
                color: white;
                position: relative;
                overflow: visible; // ✅ Cambiar de hidden a visible
                border: 4px solid #1e40af;
                display: flex;
                flex-direction: column;
            }
            
            .carnet::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(45deg, #1e40af, #3b82f6, #1e3a8a);
                border-radius: 23px;
                z-index: -1;
            }
            
            .header {
                background: rgba(255, 255, 255, 0.1);
                padding: 15px 25px;
                text-align: center;
                border-bottom: 3px solid #1e40af;
                backdrop-filter: blur(10px);
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
            }
            
            .logo-container {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
            }
            
            .logo-escudo {
                width: 60px;
                height: 60px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid #fbbf24;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                position: relative;
                overflow: hidden;
            }
            
            .logo-escudo div {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 24px;
            }
            
            .escuela-info {
                text-align: left;
            }
            
            .escuela-nombre {
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 3px;
                color: white;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                letter-spacing: 1px;
            }
            
            .carnet-titulo {
                font-size: 12px;
                color: #fbbf24;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }
            
            .contenido {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 25px;
                flex: 1;
                gap: 15px;
                min-width: 0;
            }
            
            .info-estudiante {
                flex: 1;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                min-width: 0;
            }
            
            .campo {
                background: rgba(255, 255, 255, 0.15);
                padding: 6px 10px;
                border-radius: 10px;
                border: 1px solid rgba(251, 191, 36, 0.4);
                backdrop-filter: blur(5px);
                min-width: 0;
                overflow: hidden;
                width: 100%;
                box-sizing: border-box;
            }
            
            .etiqueta {
                font-size: 8px;
                font-weight: 700;
                color: #fbbf24;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                display: block;
                margin-bottom: 3px;
            }
            
            .valor {
                font-size: 10px;
                font-weight: 600;
                color: white;
                line-height: 1.2;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                word-wrap: break-word;
                overflow-wrap: break-word;
                white-space: normal; // ✅ Permitir múltiples líneas
                overflow: visible;    // ✅ Mostrar todo el texto
                text-overflow: unset; // ✅ No truncar
                max-width: 100%;
                min-height: 20px;    // ✅ Altura mínima para nombres largos
            }
            
            .nombre-completo {
                grid-column: 1 / -1;
                background: rgba(251, 191, 36, 0.25);
                border: 2px solid #fbbf24;
                padding: 10px 15px;
                text-align: center;
            }
            
            .nombre-completo .valor {
                font-size: 16px;
                font-weight: 700;
                color: white;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            
            .qr-container {
                background: white;
                padding: 15px;
                border-radius: 15px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                border: 4px solid #1e40af;
                display: flex;
                flex-direction: column;
                align-items: center;
                flex-shrink: 0;
            }
            
            .qr-code {
                width: 110px;
                height: 110px;
                display: block;
                border-radius: 10px;
            }
            
            .qr-label {
                font-size: 8px;
                color: #1e3a8a;
                font-weight: 700;
                margin-top: 6px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .footer {
                background: rgba(0, 0, 0, 0.3);
                padding: 10px 25px;
                text-align: center;
                border-top: 2px solid rgba(251, 191, 36, 0.7);
                backdrop-filter: blur(5px);
                flex-shrink: 0;
                min-height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .direccion {
                font-size: 11px;
                color: #fbbf24;
                font-weight: 600;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                letter-spacing: 0.5px;
            }
        </style>
    </head>
    <body>
        <div class="carnet">
            <div class="header">
                <div class="logo-container">
                    <div class="logo-escudo">
                        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #1e3a8a, #3b82f6); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">IEP</div>
                    </div>
                    <div class="escuela-info">
                        <div class="escuela-nombre">IEP 70565 MARIANO NUÑEZ</div>
                        <div class="carnet-titulo">Carnet de Estudiante</div>
                    </div>
                </div>
            </div>
            
            <div class="contenido">
                <div class="info-estudiante">
                    <div class="campo nombre-completo">
                        <span class="etiqueta">NOMBRE COMPLETO:</span>
                        <div class="valor">${datosEstudiante.nombre} ${datosEstudiante.apellido}</div>
                    </div>
                    
                    <div class="campo">
                        <span class="etiqueta">GRADO:</span>
                        <div class="valor">${datosEstudiante.grado}</div>
                    </div>
                    
                    <div class="campo">
                        <span class="etiqueta">SECCIÓN:</span>
                        <div class="valor">${datosEstudiante.seccion}</div>
                    </div>
                    
                    <div class="campo">
                        <span class="etiqueta">TURNO:</span>
                        <div class="valor">${datosEstudiante.turno.toUpperCase()}</div>
                    </div>
                    
                    <div class="campo">
                        <span class="etiqueta">CÓDIGO:</span>
                        <div class="valor">${datosEstudiante.codigo_estudiante}</div>
                    </div>
                </div>
                
                <div class="qr-container">
                    <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code">
                    <div class="qr-label">Código QR</div>
                </div>
            </div>
            
            <div class="footer">
                <div class="direccion">Av. Principal 123, Lima - Perú</div>
            </div>
        </div>
    </body>
    </html>
    `;
    }
    /**
     * Genera el PDF del carnet
     */
    async generarPDFCarnet(estudianteId) {
        let browser;
        try {
            // Obtener datos del estudiante
            const datosEstudiante = await this.obtenerDatosEstudiante(estudianteId);
            if (!datosEstudiante) {
                throw new Error('Estudiante no encontrado');
            }
            // Generar QR
            const qrCodeDataURL = await this.generarQR(datosEstudiante);
            // Generar HTML
            const htmlContent = this.generarHTMLCarnet(datosEstudiante, qrCodeDataURL);
            // Generar PDF con Puppeteer
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            // Configurar la ruta base para los recursos
            await page.goto('file://' + process.cwd() + '/');
            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0'
            });
            const pdfBuffer = await page.pdf({
                width: '480px',
                printBackground: true,
                margin: {
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px'
                }
            });
            return Buffer.from(pdfBuffer);
        }
        catch (error) {
            console.error('Error al generar PDF del carnet:', error);
            throw new Error('Error al generar PDF del carnet');
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    /**
     * Valida que el estudiante exista
     */
    async validarEstudiante(estudianteId) {
        try {
            const estudiante = await prisma.estudiantes.findUnique({
                where: { id: estudianteId }
            });
            return !!estudiante;
        }
        catch (error) {
            console.error('Error al validar estudiante:', error);
            return false;
        }
    }
    /**
     * Genera HTML para carnets masivos (múltiples carnets en una página)
     */
    async generarHTMLCarnetsMasivo(estudiantes) {
        const carnetsHTML = [];
        for (const estudiante of estudiantes) {
            // Generar QR para cada estudiante
            const qrCodeDataURL = await this.generarQR({
                codigo_estudiante: estudiante.codigo_estudiante,
                nombre: estudiante.nombres,
                apellido: estudiante.apellidos,
                grado: estudiante.grados.nombre,
                seccion: estudiante.secciones.nombre,
                turno: estudiante.turno
            });
            // Generar HTML del carnet individual
            const carnetHTML = this.generarHTMLCarnet({
                codigo_estudiante: estudiante.codigo_estudiante,
                nombre: estudiante.nombres,
                apellido: estudiante.apellidos,
                grado: estudiante.grados.nombre,
                seccion: estudiante.secciones.nombre,
                turno: estudiante.turno
            }, qrCodeDataURL);
            carnetsHTML.push(carnetHTML);
        }
        return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Carnets para Impresión Masiva - IEP 70565</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                margin: 0;
                padding: 20px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #f0f2f5;
            }
            
            .carnets-container {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                max-width: 1000px;
                margin: 0 auto;
                padding: 10px;
            }
            
            .carnet-wrapper {
                page-break-inside: avoid;
                margin-bottom: 15px;
                display: flex;
                justify-content: center;
            }
            
            .carnet {
                width: 480px;
                min-height: 340px; // ✅ Cambiar height fijo por min-height
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%);
                border-radius: 20px;
                padding: 0;
                box-shadow: 0 20px 40px rgba(30, 58, 138, 0.3);
                color: white;
                position: relative;
                overflow: visible; // ✅ Cambiar de hidden a visible
                border: 4px solid #1e40af;
                display: flex;
                flex-direction: column;
            }
            
            .carnet::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(45deg, #1e40af, #3b82f6, #1e3a8a);
                border-radius: 23px;
                z-index: -1;
            }
            
            .header {
                background: rgba(255, 255, 255, 0.1);
                padding: 15px 25px;
                text-align: center;
                border-bottom: 3px solid #1e40af;
                backdrop-filter: blur(10px);
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
            }
            
            .logo-container {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
            }
            
            .logo-escudo {
                width: 60px;
                height: 60px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid #fbbf24;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                position: relative;
                overflow: hidden;
            }
            
            .logo-escudo div {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 24px;
            }
            
            .escuela-info {
                text-align: left;
            }
            
            .escuela-nombre {
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 3px;
                color: white;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                letter-spacing: 1px;
            }
            
            .carnet-titulo {
                font-size: 12px;
                color: #fbbf24;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }
            
            .contenido {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 25px;
                flex: 1;
                gap: 15px;
                min-width: 0;
            }
            
            .info-estudiante {
                flex: 1;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                min-width: 0;
            }
            
            .campo {
                background: rgba(255, 255, 255, 0.15);
                padding: 6px 10px;
                border-radius: 10px;
                border: 1px solid rgba(251, 191, 36, 0.4);
                backdrop-filter: blur(5px);
                min-width: 0;
                overflow: hidden;
                width: 100%;
                box-sizing: border-box;
            }
            
            .etiqueta {
                font-size: 8px;
                font-weight: 700;
                color: #fbbf24;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                display: block;
                margin-bottom: 3px;
            }
            
            .valor {
                font-size: 10px;
                font-weight: 600;
                color: white;
                line-height: 1.2;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                word-wrap: break-word;
                overflow-wrap: break-word;
                white-space: normal; // ✅ Permitir múltiples líneas
                overflow: visible;    // ✅ Mostrar todo el texto
                text-overflow: unset; // ✅ No truncar
                max-width: 100%;
                min-height: 20px;    // ✅ Altura mínima para nombres largos
            }
            
            .nombre-completo {
                grid-column: 1 / -1;
                background: rgba(251, 191, 36, 0.25);
                border: 2px solid #fbbf24;
                padding: 10px 15px;
                text-align: center;
            }
            
            .nombre-completo .valor {
                font-size: 16px;
                font-weight: 700;
                color: white;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            
            .qr-container {
                background: white;
                padding: 15px;
                border-radius: 15px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                border: 4px solid #1e40af;
                display: flex;
                flex-direction: column;
                align-items: center;
                flex-shrink: 0;
            }
            
            .qr-code {
                width: 110px;
                height: 110px;
                display: block;
                border-radius: 10px;
            }
            
            .qr-label {
                font-size: 8px;
                color: #1e3a8a;
                font-weight: 700;
                margin-top: 6px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .footer {
                background: rgba(0, 0, 0, 0.2);
                padding: 8px 25px;
                text-align: center;
                border-top: 2px solid rgba(251, 191, 36, 0.5);
                backdrop-filter: blur(5px);
                flex-shrink: 0;
            }
            
            .direccion {
                font-size: 10px;
                color: #fbbf24;
                font-weight: 600;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                letter-spacing: 0.5px;
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                
                .carnets-container {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
                
                .carnet-wrapper {
                    page-break-inside: avoid;
                    margin-bottom: 10px;
                }
            }
        </style>
    </head>
    <body>
        <div class="carnets-container">
            ${carnetsHTML.map(html => `<div class="carnet-wrapper">${html}</div>`).join('')}
        </div>
    </body>
    </html>
    `;
    }
    /**
     * Genera PDF para carnets masivos
     */
    async generarPDFCarnetsMasivo(htmlContent) {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            // Configurar la ruta base para los recursos
            await page.goto('file://' + process.cwd() + '/');
            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0'
            });
            const pdfBuffer = await page.pdf({
                width: '8.5in',
                height: '11in',
                printBackground: true,
                margin: {
                    top: '0.5in',
                    right: '0.5in',
                    bottom: '0.5in',
                    left: '0.5in'
                }
            });
            return Buffer.from(pdfBuffer);
        }
        catch (error) {
            console.error('Error al generar PDF de carnets masivos:', error);
            throw new Error('Error al generar PDF de carnets masivos');
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    /**
     * Generar imagen PNG del carnet (para apoderado)
     */
    async generarImagenCarnet(estudiante) {
        let browser;
        try {
            // Preparar datos del estudiante en el formato correcto
            const datosEstudiante = {
                codigo_estudiante: `EST${estudiante.id.toString().padStart(4, '0')}`,
                nombre: estudiante.nombres,
                apellido: estudiante.apellidos,
                grado: estudiante.grado,
                seccion: estudiante.seccion,
                turno: estudiante.turno || 'MAÑANA'
            };
            // Generar QR
            const qrCodeDataURL = await this.generarQR(datosEstudiante);
            // Generar HTML con los datos correctos
            const htmlContent = this.generarHTMLCarnet(datosEstudiante, qrCodeDataURL);
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            // Configurar la ruta base para los recursos
            await page.goto('file://' + process.cwd() + '/');
            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0'
            });
            // Generar imagen PNG en lugar de PDF
            const imagenBuffer = await page.screenshot({
                type: 'png',
                fullPage: false,
                clip: {
                    x: 0,
                    y: 0,
                    width: 480,
                    height: 340
                }
            });
            return Buffer.from(imagenBuffer);
        }
        catch (error) {
            console.error('Error al generar imagen del carnet:', error);
            throw new Error('Error al generar imagen del carnet');
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}
export const carnetService = new CarnetService();
//# sourceMappingURL=carnetService.js.map