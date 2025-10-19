import QRCode from 'qrcode';
import puppeteer from 'puppeteer';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class CarnetMasivoService {
  /**
   * Genera HTML para carnets masivos optimizado para impresión
   */
  async generarHTMLCarnetsMasivo(estudiantes: any[]): Promise<string> {
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
      const carnetHTML = this.generarHTMLCarnetIndividual({
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
                padding: 10px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: white;
            }
            
            .carnets-container {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                max-width: 100%;
                margin: 0 auto;
            }
            
            .carnet-wrapper {
                page-break-inside: avoid;
                margin-bottom: 8px;
                display: flex;
                justify-content: center;
            }
            
            .carnet {
                width: 400px;
                height: 280px;
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%);
                border-radius: 15px;
                padding: 0;
                box-shadow: 0 10px 20px rgba(30, 58, 138, 0.2);
                color: white;
                position: relative;
                overflow: hidden;
                border: 2px solid #fbbf24;
                display: flex;
                flex-direction: column;
            }
            
            .carnet::before {
                content: '';
                position: absolute;
                top: -1px;
                left: -1px;
                right: -1px;
                bottom: -1px;
                background: linear-gradient(45deg, #fbbf24, #f59e0b, #d97706);
                border-radius: 17px;
                z-index: -1;
            }
            
            .header {
                background: rgba(255, 255, 255, 0.1);
                padding: 10px 15px;
                text-align: center;
                border-bottom: 2px solid #fbbf24;
                backdrop-filter: blur(8px);
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .logo-container {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .logo-escudo {
                width: 40px;
                height: 40px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #fbbf24;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                position: relative;
                overflow: hidden;
            }
            
            .logo-escudo img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                border-radius: 50%;
            }
            
            .escuela-info {
                text-align: left;
            }
            
            .escuela-nombre {
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 2px;
                color: white;
                text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
                letter-spacing: 0.5px;
            }
            
            .carnet-titulo {
                font-size: 10px;
                color: #fbbf24;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }
            
            .contenido {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 18px;
                flex: 1;
                gap: 12px;
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
                border-radius: 8px;
                border: 1px solid rgba(251, 191, 36, 0.4);
                backdrop-filter: blur(3px);
                min-width: 0;
                overflow: hidden;
                width: 100%;
                box-sizing: border-box;
            }
            
            .etiqueta {
                font-size: 7px;
                font-weight: 700;
                color: #fbbf24;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                display: block;
                margin-bottom: 2px;
            }
            
            .valor {
                font-size: 10px;
                font-weight: 600;
                color: white;
                line-height: 1.2;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                word-wrap: break-word;
                overflow-wrap: break-word;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
            }
            
            .nombre-completo {
                grid-column: 1 / -1;
                background: rgba(251, 191, 36, 0.25);
                border: 2px solid #fbbf24;
                padding: 8px 12px;
                text-align: center;
            }
            
            .nombre-completo .valor {
                font-size: 14px;
                font-weight: 700;
                color: white;
                text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
            }
            
            .qr-container {
                background: white !important;
                padding: 12px;
                border-radius: 15px;
                box-shadow: 0 6px 20px rgba(0,0,0,0.25), 0 3px 8px rgba(0,0,0,0.15);
                border: 4px solid #fbbf24;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                min-width: 110px;
                height: 110px;
                position: relative;
                z-index: 10;
                box-sizing: border-box;
            }
            
            .qr-code {
                width: 80px;
                height: 80px;
                display: block;
                border-radius: 10px;
                background: white;
                padding: 3px;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
                border: 1px solid rgba(0,0,0,0.05);
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .qr-label {
                font-size: 7px;
                color: #1e3a8a;
                font-weight: 700;
                margin-top: 2px;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                text-align: center;
            }
            
            .footer {
                background: rgba(0, 0, 0, 0.2);
                padding: 6px 15px;
                text-align: center;
                border-top: 1px solid rgba(251, 191, 36, 0.5);
                backdrop-filter: blur(5px);
                flex-shrink: 0;
            }
            
            .direccion {
                font-size: 8px;
                color: #fbbf24;
                font-weight: 600;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                letter-spacing: 0.3px;
            }
            
            @media print {
                body {
                    background: white;
                    padding: 3px;
                }
                
                .carnets-container {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                    max-width: 100%;
                }
                
                .carnet-wrapper {
                    page-break-inside: avoid;
                    margin-bottom: 6px;
                }
                
                .carnet {
                    width: 380px;
                    height: 270px;
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
   * Genera HTML para un carnet individual
   */
  generarHTMLCarnetIndividual(datosEstudiante: any, qrCodeDataURL: string): string {
    return `
    <div class="carnet">
        <div class="header">
            <div class="logo-container">
                <div class="logo-escudo">
                    <img src="src/img/logo_escuela.png" alt="Logo IEP 70565" />
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
    `;
  }

  /**
   * Genera QR para estudiante
   */
  async generarQR(datosEstudiante: any): Promise<string> {
    try {
      const qrData = JSON.stringify(datosEstudiante);
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error al generar QR:', error);
      throw new Error('Error al generar código QR');
    }
  }

  /**
   * Genera PDF para carnets masivos
   */
  async generarPDFCarnetsMasivo(htmlContent: string): Promise<Buffer> {
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
          top: '0.3in',
          right: '0.3in',
          bottom: '0.3in',
          left: '0.3in'
        }
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error al generar PDF de carnets masivos:', error);
      throw new Error('Error al generar PDF de carnets masivos');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

export const carnetMasivoService = new CarnetMasivoService();
