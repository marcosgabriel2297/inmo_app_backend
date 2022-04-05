const forgotPassword = (name, href) => `<table style="width: 500px;font-family: Helvetica, Arial, sans-serif;">
<tr>
    <td>
        <center><h1>Digesto Municipal</h1></center>
    </td>
</tr>
<tr>
    <td>
        <center>
            <p>Hola ${name},</p>
            <p>Para poder modificar su contraseña debe ingresar al siguiente enlace:</p><br/>
        </center>
    </td>
</tr>
<tr>
    <td>
        <center>
            <table cellspacing="0" cellpadding="0">
                <tr>
                    <td style="border-radius: 2px;" bgcolor="#f44802">
                        <a href="${href}"
                            target="_blank"
                            style="padding: 8px 12px;
                                   border: 1px solid #f44802;
                                   border-radius: 2px;font-size: 14px; color: #ffffff;text-decoration: none;font-weight:bold;display: inline-block;">
                            Modificar contraseña
                        </a>
                    </td>
                </tr>
            </table>
        </center>
    </td>
</tr>
<tr>
    <td>
        <center>
            <br/><p>Si usted no requirió un cambio de contraseña en la aplicación, simplemente desestime el correo</p><br/>
        </center>
    </td>
</tr>
</table>`;

module.exports = forgotPassword;
