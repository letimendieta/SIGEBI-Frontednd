import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HistorialClinicoModelo } from '../../../modelos/historialClinico.modelo';
import { FuncionarioModelo } from '../../../modelos/funcionario.modelo';
import { PersonaModelo } from '../../../modelos/persona.modelo';
import { AreaModelo } from '../../../modelos/area.modelo';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { HistorialesClinicosService } from '../../../servicios/historialesClinicos.service';
import { PacientesService } from '../../../servicios/pacientes.service';
import { FuncionariosService } from '../../../servicios/funcionarios.service';
import { AreasService } from '../../../servicios/areas.service';
import { UploadFileService } from 'src/app/servicios/upload-file.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PacienteModelo } from 'src/app/modelos/paciente.modelo';
import { HistorialClinicoPacienteModelo } from 'src/app/modelos/historialClinicoPaciente.modelo';

@Component({
  selector: 'app-historialClinico',
  templateUrl: './historialClinico.component.html',
  styleUrls: ['./historialClinico.component.css']
})
export class HistorialClinicoComponent implements OnInit {
  crear = false;
  pacientes: PacienteModelo[] = [];
  historialClinico: HistorialClinicoModelo = new HistorialClinicoModelo();
  pacientePersona: PersonaModelo = new PersonaModelo();  
  paciente: PacienteModelo = new PacienteModelo();  
  listaAreas: AreaModelo;
  historialClinicoForm: FormGroup;
  buscadorForm: FormGroup;
  modificar: boolean = false;
  hcid = 0;
  selectedFiles: FileList;
  currentFile: File;
  progress = 0;
  message = '';  
  fileInfos: Observable<any>;
  cargando = false;
  alert: boolean=false;
  alertPacienteId: boolean=false;
  alertGuardar:boolean=false;
  dtOptions: any = {};
  errMsj: string;

  constructor( private historialClinicosService: HistorialesClinicosService,
               private pacientesService: PacientesService,
               private funcionariosService: FuncionariosService,
               private comunes: ComunesService,
               private areasService: AreasService,
               private route: ActivatedRoute,
               private router: Router,
               private uploadService: UploadFileService,
               private fb: FormBuilder,
               private fb2: FormBuilder,
               private modalService: NgbModal,
               private toastr: ToastrService) { 
    this.crearFormulario();
  }

  ngOnInit() {
    this.listarAreas();
    const id = this.route.snapshot.paramMap.get('id');

    if ( id !== 'nuevo' ) {
      var historialClinico: HistorialClinicoModelo = new HistorialClinicoModelo()
      historialClinico.historialClinicoId = Number(id);

      this.historialClinicosService.buscarHistorialClinicosFiltros( historialClinico )
        .subscribe( resp  => {
          if( resp.length > 0 ){      
            this.historialClinicoForm.patchValue(resp[0]);
            if( resp[0].pacienteId &&  resp[0].pacienteId ){
              this.historialClinicoForm.get('pacientes').patchValue(resp[0].pacienteId);
              this.hcid = this.historialClinicoForm.get('historialClinicoId').value;
              var cedula = this.historialClinicoForm.get('pacientes').get('personas').get('cedula').value;
              var areaId = this.historialClinicoForm.get('areas').get('areaId').value;
              this.fileInfos = this.uploadService.getFilesName(cedula + '_' + areaId + '_', "H");
            }
          }          
        });
    }else{
      this.crear = true;
    }
  } 

  selectFile(event) {
    this.progress = 0;
    this.selectedFiles = event.target.files;
  }

  obtenerPaciente(event){
    event.preventDefault();
    var id = this.historialClinicoForm.get('pacientes').get('pacienteId').value;
    if(!id){
      return null;
    }
    this.pacientesService.getPaciente( id )
      .subscribe( (resp: PacienteModelo) => {         
        this.historialClinicoForm.get('pacientes').patchValue(resp);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: e.status +'. '+ this.comunes.obtenerError(e)
          })
          this.historialClinicoForm.get('pacientes').get('pacienteId').setValue(null);
        }
      );
  }

  listarAreas() {
    var orderBy = "descripcion";
    var orderDir = "asc";
    var area = new AreaModelo();
    area.estado = "A";

    this.areasService.buscarAreasFiltrosOrder(area, orderBy, orderDir )
      .subscribe( (resp: AreaModelo) => {
        this.listaAreas = resp;
    });
  }

  obtenerFuncionario( ){
    var id = this.historialClinicoForm.get('funcionarios').get('funcionarioId').value;
    if(!id){
      return null;
    }
    this.funcionariosService.getFuncionario( id )
      .subscribe( (resp: FuncionarioModelo) => {          
        this.historialClinicoForm.get('funcionarios').patchValue(resp);
      }, e => {
          Swal.fire({
            icon: 'info',
            //title: 'Algo salió mal',
            text: e.status +'. '+ this.comunes.obtenerError(e),
          })
        }
      );
  }
  
  guardar( ) {

    if ( this.historialClinicoForm.invalid ){
      this.alertGuardar = true;
      return Object.values( this.historialClinicoForm.controls ).forEach( control => {
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    }

    if(!this.selectedFiles){
      Swal.fire({
        icon: 'info',
        text: 'No se ha seleccionado ningun archivo'
      })
      return;
    }

    Swal.fire({
      title: 'Espere',
      text: 'Guardando información',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    let peticion: Observable<any>;

    var historialClinico: HistorialClinicoModelo = new HistorialClinicoModelo();
    var paciente: PacienteModelo = new PacienteModelo();

    historialClinico = this.historialClinicoForm.getRawValue();

    historialClinico.areas.areaId = this.historialClinicoForm.get('areas').get('areaId').value;
    paciente.pacienteId = this.historialClinicoForm.get('pacientes').get('pacienteId').value;
    
    if ( historialClinico.historialClinicoId ) {       
      historialClinico.usuarioModificacion = 'admin';
      //historialClinico.pacientes = paciente;
      
      peticion = this.historialClinicosService.actualizarHistorialClinico( historialClinico );
    } else {
      historialClinico.usuarioCreacion = 'admin';
      //historialClinico.pacientes = paciente;

      peticion = this.historialClinicosService.crearHistorialClinico( historialClinico );
    }

    peticion.subscribe( resp => {
      var mensajeUpload = '';
      if(this.selectedFiles){
        var cedula = this.historialClinicoForm.get('pacientes').get('personas').get('cedula').value;
        var areaId = resp.historialClinico.areas.areaId;
        this.currentFile = this.selectedFiles.item(0);

        var archivo = this.currentFile.name.split(".")[0];
        var tipo = this.currentFile.name.split(".")[1];

        var filename = cedula + '_' + areaId + '_' + archivo;
        if (tipo) filename = filename + '_' + tipo;
        
        var renameFile = new File([this.currentFile], filename, {type:this.currentFile.type});

        this.uploadService.upload2(renameFile, "H").subscribe(
          event => {
            mensajeUpload
          },
          err => {
            mensajeUpload = 'No se pudo subir el archivo!' + err.status +'. '+ this.comunes.obtenerError(err);
            console.log(mensajeUpload);
        });

        this.selectedFiles = undefined;
      }

      
      Swal.fire({
                icon: 'success',
                title: resp.historialClinico.historialClinicoId.toString(),
                text: resp.mensaje + '. '+ mensajeUpload
              }).then( resp => {

        if ( resp.value ) {
          if ( this.historialClinico.historialClinicoId ) {
            this.router.navigate(['/historialesClinicos']);
          }else{
            this.limpiar();
          }
        }
      });
    }, e => {
            Swal.fire({
              icon: 'error',
              title: 'Algo salió mal',
              text: e.status +'. '+ this.comunes.obtenerError(e)
            })          
       }
    );
  }

  limpiar(){
    this.historialClinicoForm.reset();
    this.historialClinico = new HistorialClinicoModelo();
    this.paciente = new PacienteModelo();
    this.cerrarAlertGuardar();
  }

  obtenerError(e : any){
    var mensaje = "Error indefinido ";
      if(e.error){
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
      }
      if(e.message){
        mensaje = mensaje + ' ' + e.message;
      }
    return mensaje;  
  }

  get areaNoValido() {
    return this.historialClinicoForm.get('areas').get('areaId').invalid 
    && this.historialClinicoForm.get('areas').get('areaId').touched
  }

  get pacienteIdNoValido() {
    return this.historialClinicoForm.get('pacientes').get('pacienteId').invalid 
    && this.historialClinicoForm.get('pacientes').get('pacienteId').touched
  }
  
  crearFormulario() {
    this.historialClinicoForm = this.fb.group({
      historialClinicoId  : [null, [] ],
      pacientes : this.fb.group({
        pacienteId  : [null, [Validators.required] ],
        personas : this.fb.group({
          cedula  : [null, [] ],
          nombres  : [null, [] ],
          apellidos  : [null, [] ]
        })
      }), 
      areas: this.fb.group({     
        areaId  : [null, [Validators.required] ]
      }),
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ],             
    });

    this.buscadorForm = this.fb2.group({
      pacienteId  : ['', [] ],
      cedula  : ['', [] ],
      nombres  : ['', [] ],
      apellidos: ['', [] ]   
    });

    this.historialClinicoForm.get('historialClinicoId').disable();
    this.historialClinicoForm.get('pacientes').get('personas').get('cedula').disable();
    this.historialClinicoForm.get('pacientes').get('personas').get('nombres').disable();
    this.historialClinicoForm.get('pacientes').get('personas').get('apellidos').disable();

    this.historialClinicoForm.get('fechaCreacion').disable();
    this.historialClinicoForm.get('fechaModificacion').disable();
    this.historialClinicoForm.get('usuarioCreacion').disable();
    this.historialClinicoForm.get('usuarioModificacion').disable();
  }

  buscadorPacientes(event) {
    event.preventDefault();
    
    var persona: PersonaModelo = new PersonaModelo();
    var buscadorPaciente: PacienteModelo = new PacienteModelo();

    persona.cedula = this.buscadorForm.get('cedula').value;
    persona.nombres = this.buscadorForm.get('nombres').value;
    persona.apellidos = this.buscadorForm.get('apellidos').value;
    buscadorPaciente.personas = persona;

    if(!buscadorPaciente.personas.cedula 
      && !buscadorPaciente.personas.nombres && !buscadorPaciente.personas.apellidos){
      this.alert=true;
      return;
    }
    this.cargando = true;
    this.pacientesService.buscarPacientesFiltrosTabla(buscadorPaciente)
    .subscribe( resp => {
      this.pacientes = resp;
      this.cargando = false;
    }, e => {
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: e.status +'. '+ this.comunes.obtenerError(e)
      })
      this.cargando = false;
    });
  }

  limpiarModal(event) {
    event.preventDefault();
    this.buscadorForm.reset();
    this.pacientes = [];
  }

  cerrarAlert(){
    this.alert=false;
  }
  cerrarAlertPacienteId(){
    this.alertPacienteId=false;
  }

  crearTablaModel(){
    this.dtOptions = {
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
      { data: 'nombres' }, { data: 'apellidos' }, { data: 'historialClinicoId' }]      
    };
  }

  openModal(targetModal) {
    this.crearTablaModel();
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });
   
    this.buscadorForm.patchValue({
      pacienteId: '',
      cedula: '',
      nombres: '',
      apellidos: ''
    });
    this.pacientes = [];
    this.alert=false;
    this.alertPacienteId=false;
  }

  selectPaciente(event, paciente: PacienteModelo){
    this.alertPacienteId=false;

    this.modalService.dismissAll();
    if(paciente.pacienteId){
      this.historialClinicoForm.get('pacientes').get('pacienteId').setValue(paciente.pacienteId);
    }
    this.pacientesService.getPaciente( paciente.pacienteId )
      .subscribe( (resp: PacienteModelo) => {         
        this.historialClinicoForm.get('pacientes').patchValue(resp);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: e.status +'. '+ this.comunes.obtenerError(e)
          })
          this.historialClinicoForm.get('pacientes').get('pacienteId').setValue(null);
        }
      );
  }

  onSubmit() {
    this.modalService.dismissAll();
  }

  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }
}
