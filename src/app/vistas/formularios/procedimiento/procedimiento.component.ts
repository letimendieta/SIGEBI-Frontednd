import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ProcedimientoModelo } from '../../../modelos/procedimiento.modelo';
import { FuncionarioModelo } from '../../../modelos/funcionario.modelo';
import { PersonaModelo } from '../../../modelos/persona.modelo';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { ProcedimientosService } from '../../../servicios/procedimientos.service';
import { PacientesService } from '../../../servicios/pacientes.service';
import { FuncionariosService } from '../../../servicios/funcionarios.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { PacienteModelo } from 'src/app/modelos/paciente.modelo';
import { StockModelo } from 'src/app/modelos/stock.modelo';
import { StocksService } from 'src/app/servicios/stocks.service';
import { ProcedimientoInsumoModelo } from 'src/app/modelos/procedimientoInsumo.modelo';
import { ProcesoProcedimientoModelo } from 'src/app/modelos/procesoProcedimiento.modelo';
import { ParametroModelo } from 'src/app/modelos/parametro.modelo';
import { ParametrosService } from 'src/app/servicios/parametros.service';
import { AreaModelo } from 'src/app/modelos/area.modelo';
import { AreasService } from 'src/app/servicios/areas.service';
import { MotivoConsultaModelo } from 'src/app/modelos/motivoConsulta.modelo';
import { MotivosConsultaService } from 'src/app/servicios/motivosConsulta.service';
import { GlobalConstants } from 'src/app/common/global-constants';
import { InsumoMedicoModelo } from 'src/app/modelos/insumoMedico.modelo';
import { MedicamentoModelo } from 'src/app/modelos/medicamento.modelo';
import { DataTableDirective } from 'angular-datatables';
import { TokenService } from 'src/app/servicios/token.service';
import { UsuariosService } from 'src/app/servicios/usuarios.service';
import { Usuario2Modelo } from 'src/app/modelos/usuario2.modelo';

@Component({
  selector: 'app-procedimiento',
  templateUrl: './procedimiento.component.html',
  styleUrls: ['./procedimiento.component.css']
})
export class ProcedimientoComponent implements OnInit {
  dtElement: DataTableDirective;
  crear = false;  
  pacientePersona: PersonaModelo = new PersonaModelo();  
  funcionarioPersona: PersonaModelo = new PersonaModelo();
  pacientes: PacienteModelo[] = [];
  funcionarios: FuncionarioModelo[] = [];
  stocksMedicamentos: StockModelo[] = [];
  stocksInsumoMedico: StockModelo[] = [];
  procedimientosInsumosMedicos: ProcedimientoInsumoModelo[] = [];
  procedimientosMedicamentos: ProcedimientoInsumoModelo[] = [];
  listaMotivosConsulta: MotivoConsultaModelo[] = [];
  paciente: PacienteModelo = new PacienteModelo();
  funcionario: FuncionarioModelo = new FuncionarioModelo();
  listaAreas: AreaModelo;
  listaEstadosEntrega: ParametroModelo;
  listaMedidasMedicamentos: ParametroModelo;
  buscadorPacientesForm: FormGroup;
  buscadorFuncionariosForm: FormGroup;
  procedimientoForm: FormGroup;
  buscadorStockForm: FormGroup;
  alert:boolean=false;
  alertPacientes:boolean=false;
  alertMedicamentos:boolean=false;
  alertInsumosMedicos:boolean=false;
  alertFuncionarios:boolean=false;
  alertGuardar:boolean=false;
  dtOptionsPacientes: any = {};
  dtOptionsFuncionarios: any = {};
  dtOptionsStock: any = {};  
  dtOptionsStockInsumoMedico: any = {};  
  dtOptionsMedicamentos: any = {};
  dtOptionsInsumosMedicos: any = {};
  dtTriggerMedicamentos : Subject<any> = new Subject<any>();
  dtTriggerInsumosMedicos : Subject<any> = new Subject<any>();
  modificar: boolean = false;
  cargando = false;
  consultaId: number = null;
  procedimientoPendiente: boolean = false;
  mensajeError: String;
  finalizado = false;
  busquedaMedicamento = false;
  busquedaInsumoMedico = false;
  buscador = "";
  loadPaciente = false; loadFuncionario = false;
  loadMedicamento = false; loadInsumo = false;
  loadBuscador = false;
  loadBuscadorPacientes = false;
  loadBuscadorFuncionarios = false;

  constructor( private tokenService: TokenService,
               private procedimientosService: ProcedimientosService,
               private pacientesService: PacientesService,
               private funcionariosService: FuncionariosService,
               private stockService: StocksService,
               private parametrosService: ParametrosService,
               private motivosConsultaService: MotivosConsultaService,
               private areasService: AreasService,
               private router: Router,
               private comunes: ComunesService,
               private route: ActivatedRoute,
               private fb: FormBuilder,
               private fb2: FormBuilder,
               private fb3: FormBuilder,
               private fb4: FormBuilder,
               private modalService: NgbModal,
               private usuariosService : UsuariosService ) { 
    this.crearFormulario();
  }

  ngOnInit() {
    this.listarMotivosConsultas();
    this.crearTablaInsumosMedicos();
    this.crearTablaMedicamentos();
    this.crearTablaModelFuncionarios();
    this.crearTablaModelPacientes();
    this.crearTablaModelStock();
    
    const valorRuta = this.route.snapshot.paramMap.get('id');
    const rutaArray = valorRuta.split("-");

    const id = rutaArray.length > 0 ? rutaArray[0] : valorRuta;

    this.listarAreas("");
    this.procedimientoForm.get('estado').disable();
    if ( id !== 'nuevo' && id !== 'enfermeria' ) {
      this.procedimientosService.getProcedimiento( Number(id) )
        .subscribe( (resp: ProcedimientoModelo) => {  
          this.consultaId = resp.consultaId;   
          if( resp && resp.estado == GlobalConstants.PROC_PENDIENTE ){
            this.procedimientoPendiente = true;
          }  
          if( resp && resp.estado == GlobalConstants.PROC_FINALIZADO ){
            this.finalizado = true;
          }  
          if( resp && resp.areas && resp.areas.tipo != GlobalConstants.TIPO_AREA_SERVICIO ){
            this.listarAreas("-1");
          }
          
          this.procedimientoForm.patchValue(resp);
          this.listarEstadosEntrega();
          this.obtenerProcedimientosInsumos();
          this.deshabilitarDatos();     
        });
    }else if( id == 'enfermeria' ){
      this.crear = true;
      this.listarEstadosEntrega();  
      if( rutaArray != null && rutaArray.length > 1 ){
        this.procedimientoForm.get('pacientes').get('pacienteId').setValue(rutaArray[1]);

        this.obtenerPaciente(null);

        var usuario = new Usuario2Modelo();
        usuario.nombreUsuario = this.tokenService.getUserName().toString();
        this.usuariosService.buscarUsuariosFiltrosTabla(usuario)
          .subscribe( resp => {      
            if ( resp.length > 0){
              var funcionario = new FuncionarioModelo();
              funcionario.funcionarioId = resp[0].funcionarios.funcionarioId;
              this.selectFuncionario( funcionario );
            }
        });
      }      
    }else{
      this.crear = true;
      this.listarEstadosEntrega();      
    }
  }  

  obtenerPaciente(event){
    if(event !== null) event.preventDefault();
    var id = this.procedimientoForm.get('pacientes').get('pacienteId').value;
    if(!id){
      return null;
    }
    this.loadPaciente = true;
    this.pacientesService.getPaciente( id )
        .subscribe( (resp: PacienteModelo) => {  
          this.loadPaciente = false;       
          this.procedimientoForm.get('pacientes').patchValue(resp);         
        }, e => {
          this.loadPaciente = false;
            Swal.fire({
              icon: 'info',
              text: this.comunes.obtenerError(e),
            })
          }
        );
  }

  obtenerFuncionario(event ){
    event.preventDefault();
    var id = this.procedimientoForm.get('funcionarios').get('funcionarioId').value;
    if(!id){
      return null;
    }
    this.loadFuncionario = true;
    this.funcionariosService.getFuncionario( id )
      .subscribe( (resp: FuncionarioModelo) => {   
        this.loadFuncionario = false;       
        this.procedimientoForm.get('funcionarios').patchValue(resp);
        if( GlobalConstants.INACTIVO == resp.estado ){
          Swal.fire({
            icon: 'info',
            title: 'Atención',
            text: 'El funcionario se encuentra inactivo'
          })
        }
      }, e => {
        this.loadFuncionario = false;       
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e),
          })
        }
      );
  }

  obtenerProcedimientosInsumos() {
    var procedimientoInsumo = new ProcedimientoInsumoModelo();
    var procedimiento = new ProcedimientoModelo();

    procedimiento.procedimientoId = this.procedimientoForm.get('procedimientoId').value;
    procedimientoInsumo.procedimientos = procedimiento;    

    this.procedimientosService.obtenerProcedimientosInsumos(procedimientoInsumo)
    .subscribe( ( resp : ProcedimientoInsumoModelo[] )=> {
      var procedimientosInsumos = resp;      
      
      for (let i = 0; i < procedimientosInsumos.length; i++) {
        if(procedimientosInsumos[i].insumosMedicos && procedimientosInsumos[i].insumosMedicos.insumoMedicoId){
          this.procedimientosInsumosMedicos.push(procedimientosInsumos[i]);
        }
        if(procedimientosInsumos[i].medicamentos && procedimientosInsumos[i].medicamentos.medicamentoId){
          this.procedimientosMedicamentos.push(procedimientosInsumos[i]);
        }
      }  
    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }
  
  listarEstadosEntrega() {
    var orderBy = "descripcion";
    var orderDir = "asc";

    var sexoParam = new ParametroModelo();
    sexoParam.codigoParametro = "EST_ENTREGA_INSUMO";
    sexoParam.estado = "A";

    this.parametrosService.buscarParametrosFiltrosOrder( sexoParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo) => {
        this.listaEstadosEntrega = resp;
    });
  }

  listarMotivosConsultas() {
    var orderBy = "descripcion";
    var orderDir = "asc";
    var motivoConsulta = new MotivoConsultaModelo();
    motivoConsulta.estado = "A";

    this.motivosConsultaService.buscarMotivosConsultaFiltros(motivoConsulta, orderBy, orderDir )
      .subscribe( (resp: MotivoConsultaModelo[]) => {
        this.listaMotivosConsulta = resp;
    });
  }

  listarAreas(cantidad) {
    var orderBy = "descripcion";
    var orderDir = "asc";
    var area = new AreaModelo();
    area.estado = "A";

    if( cantidad == "-1" ){
      area.tipo = GlobalConstants.TIPO_AREA_SERVICIO + ',' +GlobalConstants.TIPO_AREA_CONSULTORIO;
    }else{
      area.tipo = GlobalConstants.TIPO_AREA_SERVICIO;
    }

    this.areasService.buscarAreasFiltrosOrder(area, orderBy, orderDir )
      .subscribe( (resp: AreaModelo) => {
        this.listaAreas = resp;
    });
  }

  deshabilitarDatos(){
    this.procedimientoForm.get('pacientes').get('pacienteId').disable();
    this.procedimientoForm.get('funcionarios').get('funcionarioId').disable();
    this.procedimientoForm.get('areas').get('areaId').disable();
    this.procedimientoForm.get('fecha').disable();
    this.procedimientoForm.get('motivoConsulta').get('motivoConsultaId').disable();
    if(this.finalizado){
      this.procedimientoForm.get('notas').disable();
    }
  }
  
  guardar( event ) {
    event.preventDefault();
    this.cerrarAlertGuardar();
    if ( this.procedimientoForm.invalid ){
      this.alertGuardar = true;
      
      var camposObligatorios;
      for (let el in this.procedimientoForm.controls) {
        if (this.procedimientoForm.controls[el].errors) {
          console.log(el)
          camposObligatorios = camposObligatorios + el;
        }
      } 
      this.mensajeError = "Existen campos obligatorios. Verifique. ";
      return Object.values( this.procedimientoForm.controls ).forEach( control => {
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    }

    Swal.fire({
      title: 'Espere',
      text: 'Guardando información',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    let peticion: Observable<any>;
    var procesoProcedimientoInsumo: ProcesoProcedimientoModelo = new ProcesoProcedimientoModelo();
    var procedimiento: ProcedimientoModelo = new ProcedimientoModelo();
    var procedimientoInsumo: ProcedimientoInsumoModelo[] = [];

    procedimiento = this.procedimientoForm.getRawValue();
    procedimiento.estado = GlobalConstants.PROC_FINALIZADO;

    procedimientoInsumo = this.unificarProcedimientosInsumos(procedimiento);
    
    procesoProcedimientoInsumo.procedimiento = procedimiento;
    procesoProcedimientoInsumo.procedimientoInsumoList = procedimientoInsumo;
  
    if ( procedimiento.procedimientoId ) {
      procesoProcedimientoInsumo.procedimiento.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.procedimientosService.actualizarProcedimiento( procesoProcedimientoInsumo );
    } else {
      procesoProcedimientoInsumo.procedimiento.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.procedimientosService.crearProcedimiento( procesoProcedimientoInsumo );
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: procedimiento.procedimientoId ? procedimiento.procedimientoId.toString() : '',
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( !this.crear ) {
            this.router.navigate(['/inicio/procedimientos']);
          }else{
            this.limpiar();
          }
        }
      });
    }, e => {          
        Swal.fire({
          icon: 'error',
          title: 'Algo salió mal',
          text: this.comunes.obtenerError(e),
        })          
      }
    );
  }

  unificarProcedimientosInsumos(procedimiento: ProcedimientoModelo){
    var procedimientoInsumo: ProcedimientoInsumoModelo[] = [];

    for (let i = 0; i < this.procedimientosMedicamentos.length; i++) {

      var rows =  $('#tableMedicamentos').DataTable().rows().data();  
      var cantidades = rows.$('input').serializeArray();
      var estados = rows.$('select').serializeArray();

      var contador = 0;
      for (let a = 0; a < estados.length; a++) {
        if(estados[a].name == "estado"){
          this.procedimientosMedicamentos[contador].estado = estados[a].value;
          contador++;      
        }      
      }

      for (let k = 0; k < cantidades.length; k++) {
        if( !procedimiento.consultaId){
          this.procedimientosMedicamentos[k].cantidad = Number(cantidades[k].value);
        }
      }
      this.procedimientosMedicamentos[i].insumosMedicos = null;
      procedimientoInsumo.push(this.procedimientosMedicamentos[i]);
    }

    for (let j = 0; j < this.procedimientosInsumosMedicos.length; j++) {

      var rows =  $('#tableInsumosMedicos').DataTable().rows().data();  
      var cantidades = rows.$('input').serializeArray();
      var estados = rows.$('select').serializeArray();

      var contador = 0;
      for (let b = 0; b < estados.length; b++) {
        if(estados[b].name == "estado"){
          this.procedimientosInsumosMedicos[contador].estado = estados[b].value;
          contador++;      
        }      
      }

      for (let k = 0; k < cantidades.length; k++) {
        if( !procedimiento.consultaId){
          this.procedimientosInsumosMedicos[k].cantidad = Number(cantidades[k].value);
        }
      }
      procedimientoInsumo.push(this.procedimientosInsumosMedicos[j]);
    }

    return procedimientoInsumo;
  }

  limpiar(){
    this.procedimientoForm.reset();
    this.paciente = new PacienteModelo();
    this.funcionario = new FuncionarioModelo();
    this.procedimientosInsumosMedicos = [];
    this.procedimientosMedicamentos = [];
    $('#tableInsumosMedicos').DataTable().destroy();
    this.dtTriggerInsumosMedicos.next();
    $('#tableMedicamentos').DataTable().destroy();
    this.dtTriggerMedicamentos.next();
    this.procedimientoForm.get('funcionarios').get('funcionarioId').enable();
    this.procedimientoForm.get('areas').get('areaId').enable();
    this.procedimientoForm.get('fecha').enable();
    this.consultaId = null;
  }

  obtenerError(e : any){
    var mensaje = "Error indefinido ";
      if(e.error.mensaje){
        mensaje = e.error.mensaje;
      }
      if(e.error.message){
        mensaje = e.error.message;
      }
      if(e.error.errors){
        mensaje = mensaje + ' ' + e.error.errors[0];
      }
      if(e.error.error){
        mensaje = mensaje + ' ' + e.error.error;
      }
    return mensaje;  
  }
  
  get pacienteIdNoValido() {
    return this.procedimientoForm.get('pacientes').get('pacienteId').invalid 
    && this.procedimientoForm.get('pacientes').get('pacienteId').touched
  }

  get funcionarioIdNoValido() {
    return this.procedimientoForm.get('funcionarios').get('funcionarioId').invalid 
    && this.procedimientoForm.get('funcionarios').get('funcionarioId').touched
  }

  get areaNoValido() {
    return this.procedimientoForm.get('areas').get('areaId').invalid 
    && this.procedimientoForm.get('areas').get('areaId').touched
  }

  get fechaNoValido() {
    return this.procedimientoForm.get('fecha').invalid 
    && this.procedimientoForm.get('fecha').touched
  }

  get motivoNoValido() {
    return this.procedimientoForm.get('motivoConsulta').get('motivoConsultaId').invalid 
    && this.procedimientoForm.get('motivoConsulta').get('motivoConsultaId').touched
  }

  crearFormulario() {
    this.procedimientoForm = this.fb.group({
      procedimientoId  : [null, [] ],
      areas: this.fb.group({     
        areaId  : [null, [Validators.required] ]
      }),
      consultaId  : [null, [] ],
      motivoConsulta: this.fb.group({     
        motivoConsultaId  : [null, [Validators.required] ]
      }),
      estado  : [null, [] ],
      pacientes : this.fb.group({
        pacienteId  : [null, [Validators.required] ],
        personas : this.fb.group({
          cedula  : [null, [] ],
          nombres  : [null, [] ],
          apellidos  : [null, [] ]
        })
      }),
      funcionarios : this.fb.group({
        funcionarioId  : [null, [Validators.required] ],
        personas : this.fb.group({
          cedula  : [null, [] ],
          nombres  : [null, [] ],
          apellidos  : [null, [] ]
        })
      }),    
      fecha  : [null, [Validators.required] ],
      notas  : [null, [] ],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ],             
    });

    this.buscadorPacientesForm = this.fb2.group({
      pacienteId  : ['', [] ],
      cedula  : ['', [] ],
      nombres  : ['', [] ],
      apellidos: ['', [] ]   
    });

    this.buscadorFuncionariosForm = this.fb3.group({
      funcionarioId  : ['', [] ],
      cedula  : ['', [] ],
      nombres  : ['', [] ],
      apellidos: ['', [] ]   
    });

    this.buscadorStockForm = this.fb4.group({
      medicamentoId  : [null, [] ],
      codigoMedicamento  : [null, [] ],
      medicamento  : [null, [] ],
      insumoMedicoId  : [null, [] ],
      codigoInsumo  : [null, [] ],
      nombre  : [null, [] ]
    });

    this.procedimientoForm.get('procedimientoId').disable();
    this.procedimientoForm.get('pacientes').get('personas').get('cedula').disable();
    this.procedimientoForm.get('pacientes').get('personas').get('nombres').disable();
    this.procedimientoForm.get('pacientes').get('personas').get('apellidos').disable();

    this.procedimientoForm.get('funcionarios').get('personas').get('cedula').disable();
    this.procedimientoForm.get('funcionarios').get('personas').get('nombres').disable();
    this.procedimientoForm.get('funcionarios').get('personas').get('apellidos').disable();

    this.procedimientoForm.get('fechaCreacion').disable();
    this.procedimientoForm.get('fechaModificacion').disable();
    this.procedimientoForm.get('usuarioCreacion').disable();
    this.procedimientoForm.get('usuarioModificacion').disable();
  }

  buscadorPacientes(event) {
    event.preventDefault();
    
    var persona: PersonaModelo = new PersonaModelo();
    var buscadorPaciente: PacienteModelo = new PacienteModelo();

    persona.cedula = this.buscadorPacientesForm.get('cedula').value;
    persona.nombres = this.buscadorPacientesForm.get('nombres').value;
    persona.apellidos = this.buscadorPacientesForm.get('apellidos').value;
    buscadorPaciente.personas = persona;

    if(!buscadorPaciente.personas.cedula 
      && !buscadorPaciente.personas.nombres && !buscadorPaciente.personas.apellidos){
      this.alert=true;
      return;
    }
    this.cargando = true;
    this.loadBuscadorPacientes = true;
    this.pacientesService.buscarPacientesFiltrosTabla(buscadorPaciente)
    .subscribe( ( resp : PacienteModelo[] )=> {
      this.loadBuscadorPacientes = false;
      this.pacientes = resp;
      this.cargando = false;
    }, e => {
      this.loadBuscadorPacientes = false;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
      this.cargando = false;
    });
  }

  buscadorFuncionarios(event) {
    event.preventDefault();
    var persona: PersonaModelo = new PersonaModelo();
    var buscador: FuncionarioModelo = new FuncionarioModelo();

    persona.cedula = this.buscadorFuncionariosForm.get('cedula').value;
    persona.nombres = this.buscadorFuncionariosForm.get('nombres').value;
    persona.apellidos = this.buscadorFuncionariosForm.get('apellidos').value;
    buscador.personas = persona;
    buscador.funcionarioId = this.buscadorFuncionariosForm.get('funcionarioId').value;    

    this.loadBuscadorFuncionarios = true;
    this.funcionariosService.buscarFuncionariosFiltrosTabla(buscador)
    .subscribe( ( resp : FuncionarioModelo[] )=> {
      this.loadBuscadorFuncionarios = false;
      this.funcionarios = resp;
      this.cargando = false;
    }, e => {
      this.loadBuscadorFuncionarios = false;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
      this.cargando = false;
    });
  }

  buscadorStock(event) {
    event.preventDefault();
    var buscador = new StockModelo();
    var medicamento = new MedicamentoModelo();
    var insumoMedico = new InsumoMedicoModelo();

    medicamento.medicamentoId = this.buscadorStockForm.get('medicamentoId').value;
    medicamento.codigo = this.buscadorStockForm.get('codigoMedicamento').value;
    medicamento.medicamento = this.buscadorStockForm.get('medicamento').value;
    insumoMedico.insumoMedicoId = this.buscadorStockForm.get('insumoMedicoId').value;
    insumoMedico.codigo = this.buscadorStockForm.get('codigoInsumo').value;
    insumoMedico.nombre = this.buscadorStockForm.get('nombre').value;

    if(!medicamento.medicamentoId && !medicamento.medicamento && !medicamento.codigo
      && !insumoMedico.insumoMedicoId && !insumoMedico.codigo
      && !insumoMedico.nombre){
      this.alert=true;
      return;
    }
    if(!medicamento.medicamentoId && !medicamento.medicamento && !medicamento.codigo){
      medicamento = null;
    }
    if(!insumoMedico.insumoMedicoId && !insumoMedico.codigo
      && !insumoMedico.nombre){
      insumoMedico = null;
    }

    buscador.medicamentos = medicamento;
    buscador.insumosMedicos = insumoMedico;

    this.loadBuscador = true;
    this.stockService.buscarStocksFiltrosTabla(buscador)
    .subscribe( ( resp : StockModelo[] ) => {
      this.loadBuscador = false;
      var stocks = resp;

      if(stocks.length > 0){
        for (let i = 0; i < stocks.length; i++) {
          if(stocks[i].insumosMedicos && stocks[i].insumosMedicos.insumoMedicoId){
            this.busquedaInsumoMedico = true;
            this.busquedaMedicamento = false;
            this.stocksInsumoMedico = stocks;
          }
          if(stocks[i].medicamentos && stocks[i].medicamentos.medicamentoId){            
            this.busquedaMedicamento = true;
            this.busquedaInsumoMedico = false;
            this.stocksMedicamentos = stocks;
          }
        }
      }else{
        this.busquedaInsumoMedico = false;
        this.busquedaMedicamento = false;       
      }  

    }, e => {
      this.loadBuscador = false;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  buscarInsumo(event) {
    event.preventDefault();
    var buscador = new StockModelo();
    var insumoMedico = new InsumoMedicoModelo();

    var insumoIdInput = (document.getElementById("insumoId") as HTMLInputElement).value;

    if( !insumoIdInput ){
      return;
    }
    insumoMedico.insumoMedicoId = Number(insumoIdInput);    
    
    buscador.insumosMedicos = insumoMedico;
    this.loadInsumo = true;
    this.stockService.buscarStocksFiltrosTabla(buscador)
    .subscribe( ( resp : StockModelo[] ) => {
      this.loadInsumo = false;
      var stocks = resp;
      if( stocks.length > 0 ){ 
        (document.getElementById("insumoId") as HTMLInputElement).value = null;

        var procedimientoInsumo: ProcedimientoInsumoModelo  = new ProcedimientoInsumoModelo();
        procedimientoInsumo.insumosMedicos = stocks[0].insumosMedicos;

        if(this.procedimientosInsumosMedicos.length > 0){
          for (let i = 0; i < this.procedimientosInsumosMedicos.length; i++) {
            if(this.procedimientosInsumosMedicos[i].insumosMedicos.insumoMedicoId == stocks[0].insumosMedicos.insumoMedicoId){
              this.alertInsumosMedicos=true;
              return null;
            }
          }
          $('#tableInsumosMedicos').DataTable().destroy();
          this.procedimientosInsumosMedicos.push(procedimientoInsumo);
          this.dtTriggerInsumosMedicos.next();
        }else{
          $('#tableInsumosMedicos').DataTable().destroy();
          this.procedimientosInsumosMedicos.push(procedimientoInsumo);
          this.dtTriggerInsumosMedicos.next();        
        }
      }
    }, e => {
      this.loadInsumo = false;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  buscarMedicamento(event) {    
    event.preventDefault();
    var buscador = new StockModelo();
    var medicamento = new MedicamentoModelo();

    var medicamentoIdInput = (document.getElementById("medicamentoId") as HTMLInputElement).value;

    if( !medicamentoIdInput ){
      return;
    }
    medicamento.medicamentoId = Number(medicamentoIdInput);    
    
    buscador.medicamentos = medicamento;

    this.loadMedicamento = true;
    this.stockService.buscarStocksFiltrosTabla(buscador)
    .subscribe( ( resp : StockModelo[] ) => {
      this.loadMedicamento = false;
      var stocks = resp;
      if( stocks.length > 0 ){  
        (document.getElementById("medicamentoId") as HTMLInputElement).value = null;

        var procedimientoInsumo: ProcedimientoInsumoModelo  = new ProcedimientoInsumoModelo();
        procedimientoInsumo.medicamentos = stocks[0].medicamentos;

        if(this.procedimientosMedicamentos.length > 0){
          for (let i = 0; i < this.procedimientosMedicamentos.length; i++) {
            if(this.procedimientosMedicamentos[i].medicamentos.medicamentoId == stocks[0].medicamentos.medicamentoId){
              this.alertMedicamentos=true;
              return null;
            }
          }
          $('#tableMedicamentos').DataTable().destroy();
          this.procedimientosMedicamentos.push(procedimientoInsumo);
          this.dtTriggerMedicamentos.next();
        }else{
          $('#tableMedicamentos').DataTable().destroy();
          this.procedimientosMedicamentos.push(procedimientoInsumo);
          this.dtTriggerMedicamentos.next();        
        }
      }
    }, e => {
      this.loadMedicamento = false;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  limpiarModalPacientes(event) {
    event.preventDefault();
    this.buscadorPacientesForm.reset();
    this.pacientes = [];
  }

  limpiarModalFuncionarios(event) {
    event.preventDefault();
    this.buscadorFuncionariosForm.reset();
    this.funcionarios = [];
  }

  limpiarModalStock(event) {
    event.preventDefault();
    this.busquedaInsumoMedico = false;
    this.busquedaMedicamento = false;
    this.buscadorStockForm.reset();
  }

  cerrarAlert(){
    this.alert=false;
  }
  cerrarAlertMedicamento(){
    this.alertMedicamentos=false;
  }
  cerrarAlertInsumoMedico(){
    this.alertInsumosMedicos=false;
  }
  cerrarAlertPaciente(){
    this.alertPacientes=false;
  }
  cerrarAlertFuncionarios(){
    this.alertFuncionarios=false;
  }
  crearTablaModelPacientes(){
    this.dtOptionsPacientes = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      language: {
        "lengthMenu": "Mostrar _MENU_ registros",
        "zeroRecords": "No se encontraron resultados",
        "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
        "infoFiltered": "(filtrado de un total de _MAX_ registros)",
        "sSearch": "Buscar:",
        "oPaginate": {
          "sFirst": "Primero",
          "sLast":"Último",
          "sNext":"Siguiente",
          "sPrevious": "Anterior"
        },
        "sProcessing":"Procesando...",
      },     
      searching: false,
      processing: true,
      columns: [ { data: 'pacienteId' }, { data: 'cedula' }, 
      { data: 'nombres' }, { data: 'apellidos' }]      
    };
  }

  crearTablaModelFuncionarios(){
    this.dtOptionsFuncionarios = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      language: {
        "lengthMenu": "Mostrar _MENU_ registros",
        "zeroRecords": "No se encontraron resultados",
        "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
        "infoFiltered": "(filtrado de un total de _MAX_ registros)",
        "sSearch": "Buscar:",
        "oPaginate": {
          "sFirst": "Primero",
          "sLast":"Último",
          "sNext":"Siguiente",
          "sPrevious": "Anterior"
        },
        "sProcessing":"Procesando...",
      },     
      searching: false,
      processing: true,
      columns: [ { data: 'funcionarioId' }, { data: 'cedula' }, 
      { data: 'nombres' }, { data: 'apellidos' }]      
    };
  }

  crearTablaModelStock(){
    this.dtOptionsStock = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      language: {
        "lengthMenu": "Mostrar _MENU_ registros",
        "zeroRecords": "No se encontraron resultados",
        "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
        "infoFiltered": "(filtrado de un total de _MAX_ registros)",
        "sSearch": "Buscar:",
        "oPaginate": {
          "sFirst": "Primero",
          "sLast":"Último",
          "sNext":"Siguiente",
          "sPrevious": "Anterior"
        },
        "sProcessing":"Procesando...",
      },     
      searching: false,
      processing: true,
      columns: [ {data:'stockId'}, {data:'insumos.codigo'}, 
      {data:'insumos.descripcion'}, {data:'insumos.tipo'},
      {data:'cantidad'}, {data:'estado'}, 
      {data:'unidadMedida'}]      
    };

    this.dtOptionsStockInsumoMedico = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      language: {
        "lengthMenu": "Mostrar _MENU_ registros",
        "zeroRecords": "No se encontraron resultados",
        "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
        "infoFiltered": "(filtrado de un total de _MAX_ registros)",
        "sSearch": "Buscar:",
        "oPaginate": {
          "sFirst": "Primero",
          "sLast":"Último",
          "sNext":"Siguiente",
          "sPrevious": "Anterior"
        },
        "sProcessing":"Procesando...",
      },     
      searching: false,
      processing: true,
      columns: [ {data:'insumo.insumoMedicoId'}, {data:'insumo.codigo'}, 
      {data:'insumo.nombre'}, {data:'insumo.presentacion'},
      {data:'insumo.unidadMedida'}, {data:'cantidad'}]      
    };
  }

  crearTablaMedicamentos(){
    this.dtOptionsMedicamentos = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      searching: false,  
      language: {
        "lengthMenu": "Mostrar _MENU_ registros",
        "zeroRecords": "No se encontraron resultados",
        "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
        "infoFiltered": "(filtrado de un total de _MAX_ registros)",
        "sSearch": "Buscar:",
        "oPaginate": {
          "sFirst": "Primero",
          "sLast":"Último",
          "sNext":"Siguiente",
          "sPrevious": "Anterior"
        },
        "sProcessing":"Procesando...",
        "emptyTable":" "
      },
      processing: true,
      columns: [
        {data:'#'},
        {data:'medicamentos.medicamentoId'}, {data:'medicamentos.codigo'},
         {data:'.medicamentos.medicamento'},
        {data:'medicamentos.concentracion'}, 
        {data:'medicamentos.forma'}, {data:'medicamentos.presentacion'}, 
        {data:'cantidad'},{data:'estado'}, {data:'quitar'}
      ]      
    };
  }

  crearTablaInsumosMedicos(){
    this.dtOptionsInsumosMedicos = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      searching: false,  
      language: {
        "lengthMenu": "Mostrar _MENU_ registros",
        "zeroRecords": "No se encontraron resultados",
        "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
        "infoFiltered": "(filtrado de un total de _MAX_ registros)",
        "sSearch": "Buscar:",
        "oPaginate": {
          "sFirst": "Primero",
          "sLast":"Último",
          "sNext":"Siguiente",
          "sPrevious": "Anterior"
        },
        "sProcessing":"Procesando...",
        "emptyTable":" "
      },
      processing: true,
      columns: [
        {data:'#'},
        {data:'insumosMedicos.insumoMedicoId'}, 
        {data:'insumosMedicos.codigo'},
        {data:'insumosMedicos.nombre'},
        {data:'insumosMedicos.presentacion'}, 
        {data:'insumosMedicos.unidadMedida'},
        {data:'cantidad'},{data:'estado'}, {data:'quitar'}
      ]      
    };
  }

  quitarMedicamento(event, procedimientoInsumo: ProcedimientoInsumoModelo ) {

    for (let i = 0; i < this.procedimientosMedicamentos.length; i++) {
      if( this.procedimientosMedicamentos[i].medicamentos.medicamentoId == procedimientoInsumo.medicamentos.medicamentoId ){
        $('#tableMedicamentos').DataTable().destroy();
        this.procedimientosMedicamentos.splice(i, 1);        
        this.dtTriggerMedicamentos.next();
        break;
      }
    }
  }

  quitarInsumoMedico(event, procedimientoInsumo: ProcedimientoInsumoModelo ) {

    for (let i = 0; i < this.procedimientosInsumosMedicos.length; i++) {
      if( this.procedimientosInsumosMedicos[i].insumosMedicos.insumoMedicoId == procedimientoInsumo.insumosMedicos.insumoMedicoId ){
        $('#tableInsumosMedicos').DataTable().destroy();
        this.procedimientosInsumosMedicos.splice(i, 1);        
        this.dtTriggerInsumosMedicos.next();
        break;
      }
    }
  }

  openModalPacientes(targetModal) {
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });
   
    this.buscadorPacientesForm.patchValue({
      pacienteId: '',
      cedula: '',
      nombres: '',
      apellidos: ''
    });
    this.pacientes = [];
    this.alert=false;
  }

  openModalFuncionarios(targetModal) {
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });
   
    this.buscadorFuncionariosForm.patchValue({
      funcionarioId: '',
      cedula: '',
      nombres: '',
      apellidos: ''
    });
    this.funcionarios = [];
    this.alert=false;
  }
  openModalStock(targetModal, tipo) {
    this.buscador = tipo;
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });

    this.busquedaInsumoMedico = false;
    this.busquedaMedicamento = false;
    
    this.buscadorStockForm.patchValue({
      medicamentoId: null,
      codigoMedicamento: null,
      medicamento: null,
      insumoMedicoId: null,
      codigoInsumo: null,
      nombre: null
    });
    this.stocksMedicamentos = [];
    this.alert=false;
  }

  selectPaciente(event, paciente: PacienteModelo){
    this.modalService.dismissAll();
    if(paciente.pacienteId){
      this.procedimientoForm.get('pacientes').get('pacienteId').setValue(paciente.pacienteId);
    }
    this.pacientesService.getPaciente( paciente.pacienteId )
      .subscribe( (resp: PacienteModelo) => {         
        this.procedimientoForm.get('pacientes').patchValue(resp);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
          this.procedimientoForm.get('pacientes').get('pacienteId').setValue(null);
        }
      );
  }

  selectFuncionario(funcionario: FuncionarioModelo){
    this.modalService.dismissAll();
    if(funcionario.funcionarioId){
      this.procedimientoForm.get('funcionarios').get('funcionarioId').setValue(funcionario.funcionarioId);
    }
    this.funcionariosService.getFuncionario( funcionario.funcionarioId )
      .subscribe( (resp: FuncionarioModelo) => {         
        this.procedimientoForm.get('funcionarios').patchValue(resp);
        if( GlobalConstants.INACTIVO == resp.estado ){
          Swal.fire({
            icon: 'info',
            title: 'Atención',
            text: 'El funcionario se encuentra inactivo'
          })
        }
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
          this.procedimientoForm.get('funcionarios').get('funcionarioId').setValue(null);
        }
      );
  }

  selectStock(event, stock: StockModelo){
    this.modalService.dismissAll();

    if(stock.insumosMedicos && stock.insumosMedicos.insumoMedicoId){

      var procedimientoInsumo: ProcedimientoInsumoModelo  = new ProcedimientoInsumoModelo();
      procedimientoInsumo.insumosMedicos = stock.insumosMedicos;

      if(this.procedimientosInsumosMedicos.length > 0){
        for (let i = 0; i < this.procedimientosInsumosMedicos.length; i++) {
          if(this.procedimientosInsumosMedicos[i].insumosMedicos.insumoMedicoId == stock.insumosMedicos.insumoMedicoId){
            this.alertInsumosMedicos=true;
            return null;
          }
        }
        $('#tableInsumosMedicos').DataTable().destroy();
        this.procedimientosInsumosMedicos.push(procedimientoInsumo);
        this.dtTriggerInsumosMedicos.next();
      }else{
        $('#tableInsumosMedicos').DataTable().destroy();
        this.procedimientosInsumosMedicos.push(procedimientoInsumo);
        this.dtTriggerInsumosMedicos.next();        
      }
     
    }else if(stock.medicamentos && stock.medicamentos.medicamentoId){

      var procedimientoInsumo: ProcedimientoInsumoModelo  = new ProcedimientoInsumoModelo();
      procedimientoInsumo.medicamentos = stock.medicamentos;

      if(this.procedimientosMedicamentos.length > 0){
        for (let i = 0; i < this.procedimientosMedicamentos.length; i++) {
          if(this.procedimientosMedicamentos[i].medicamentos.medicamentoId == stock.medicamentos.medicamentoId){
            this.alertMedicamentos=true;
            return null;
          }
        }
        $('#tableMedicamentos').DataTable().destroy();
        this.procedimientosMedicamentos.push(procedimientoInsumo);
        this.dtTriggerMedicamentos.next();
      }else{
        $('#tableMedicamentos').DataTable().destroy();
        this.procedimientosMedicamentos.push(procedimientoInsumo);
        this.dtTriggerMedicamentos.next();        
      }     
    }
  }

  onSubmit() {
    this.modalService.dismissAll();
  }

  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }
}
