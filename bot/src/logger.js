import chalk from 'chalk';

export default {
  info: msg => console.log(chalk.blue(`[${new Date().toLocaleTimeString()}] INFO: ${msg}`)),
  success: msg => console.log(chalk.green(`[${new Date().toLocaleTimeString()}] OK: ${msg}`)),
  warn: msg => console.log(chalk.yellow(`[${new Date().toLocaleTimeString()}] WARN: ${msg}`)),
  error: msg => console.log(chalk.red(`[${new Date().toLocaleTimeString()}] ERRO: ${msg}`)),
  qr: (qr) => {
    console.log(chalk.yellow('\n[QR CODE REQUERIDO]'));
    console.log(chalk.cyan('Escaneie este QR Code com seu WhatsApp:'));
    console.log(qr);
  }
};