const { render } = require("ejs");
const conexion = require("../conexion");
const { route } = require("../route");

var ventas,ingresos,egresos;

const reporteDiario = async (req, res) => {
  try {
    const { fecha } = req.body;
    ventas = await ventaDiaria(fecha);
    ingresos = await ingresoEfectivoDiario(fecha);
    egresos = await egresoEfectivoDiario(fecha);
    let datos = {};
    datos.ventaDiaria = ventas;
    datos.ingresoEfectivo = ingresos;
    datos.egresoEfectivo = egresos;
    datos.existenciaCaja = existenciaCaja(
      ventas,
      ingresos,
      egresos
    )
    res.send(datos);
  } catch (error) {
    console.log(error);
  }
};

const getFacturas = async(req,res)=>{
  try {
    const {fecha} = req.body;
    const facturas = await conexion.query("SELECT * FROM facturas WHERE DATE(fecha) = ?",[fecha]);
    res.send(facturas);
  } catch (error) {
    console.log(error);
  }
}

const getFactura = async(req,res)=>{
  try {
    const {id} = req.body;
    let factura = await conexion.query("SELECT * FROM facturas WHERE id=?",[id]);
    res.send(factura);
  } catch (error) {
    console.log(error)
  }
}

const ventaDiaria = async (fecha) => {
  let venta;
  let getVenta = await conexion.query(
    "SELECT SUM(totalFactura) AS total FROM facturas WHERE fecha = ?",
    [fecha]
  );
  if (getVenta[0].total !== null) {
    venta = parseFloat(getVenta[0].total).toFixed(2);
  } else {
    venta = 0.00;
  }
  return venta;
};

const ingresoEfectivoDiario = async (fecha) => {
  let ingreso;
  let getIngresos = await conexion.query(
    "SELECT SUM(monto) AS total FROM transaccion WHERE fecha = ? AND tipoTransaccion = 'Ingreso'",
    [fecha]
  );
  if (getIngresos[0].total !== null) {
    ingreso = parseFloat(getIngresos[0].total).toFixed(2);
  } else {
    ingreso = 0.00;
  }
  return ingreso;
};

const egresoEfectivoDiario = async (fecha) => {
  let egreso;
  let getEgresos = await conexion.query(
    "SELECT SUM(monto) AS total FROM transaccion WHERE fecha = ? AND tipoTransaccion = 'Egreso'",
    [fecha]
  );
  if (getEgresos[0].total !== null) {
    egreso = parseFloat(getEgresos[0].total).toFixed(2);
  } else {
    egreso = 0.00;
  }
  return egreso;
};

const existenciaCaja = (ventas,ingresos,egresos)=>{
  let total = (parseFloat(ventas) + parseFloat(ingresos)) - parseFloat(egresos);
  return total.toFixed(2);
}


module.exports = {
    reporteDiario,
    getFacturas,
    getFactura
}