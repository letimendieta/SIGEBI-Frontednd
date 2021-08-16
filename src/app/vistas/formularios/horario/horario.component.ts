import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FuncionarioModelo } from '../../../modelos/funcionario.modelo';
import { PersonaModelo } from '../../../modelos/persona.modelo';
import { HorarioModelo } from '../../../modelos/horario.modelo';
import { HorariosService } from '../../../servicios/horarios.service';
import { FuncionariosService } from '../../../servicios/funcionarios.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ComunesService } from 'src/app/servicios/comunes.service';

import Swal from 'sweetalert2';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-horario',
  templateUrl: './horario.component.html',
  styleUrls: ['./horario.component.css']
})
export class HorarioComponent implements OnInit {
  crear = false;
  horarioForm: FormGroup;
  funcionarios: FuncionarioModelo[] = [];
  buscadorFuncionariosForm: FormGroup;
  horario: HorarioModelo = new HorarioModelo();
  cargando = false;
  alert:boolean=false;
  alertGuardar:boolean=false;
  dtOptions: any = {};
  loadBuscadorFuncionarios = false;

  constructor( private tokenService: TokenService,
               private horariosService: HorariosService,
               private funcionariosService: FuncionariosService,
               private route: ActivatedRoute,
               private comunes: ComunesService,
               private router: Router,
               private fb: FormBuilder,
               private fb2: FormBuilder,
               private modalService: NgbModal ) { 
    this.crearFormulario();
  }              

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.horarioForm.get('estado').setValue('A');
    if ( id !== 'nuevo' ) {
      
      this.horariosService.getHorario( Number(id) )
        .subscribe( (resp: HorarioModelo) => {
          this.horarioForm.patchValue(resp);
        });
    }else{
      this.crear = true;
    }
  } 

  obtenerFuncionario(event){
    event.preventDefault();
    var id = this.horarioForm.get('funcionarios').get('funcionarioId').value;
    if(!id){
      return null;
    }
    this.funcionariosService.getFuncionario( id )
      .subscribe( (resp: FuncionarioModelo) => {          
        this.horarioForm.get('funcionarios').patchValue(resp);
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

    if ( this.horarioForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.horarioForm.controls ).forEach( control => {

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

    this.horario = this.horarioForm.getRawValue();

    if ( this.horario.horarioDisponibleId ) {
      //Modificar
      this.horario.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.horariosService.actualizarHorario( this.horario );
    } else {
      //Agregar
      this.horario.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.horariosService.crearHorario( this.horario );
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: resp.horariosDisponible.horarioDisponibleId.toString(),
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( this.horario.horarioDisponibleId ) {
            this.router.navigate(['/horarios']);
          }else{
            this.limpiar();
          }
        }

      });
    }, e => {Swal.fire({
              icon: 'error',
              title: 'Algo salió mal',
              text: e.status +'. '+ this.comunes.obtenerError(e),
            })
       }
    );
  }

  limpiar(){
    this.horario = new HorarioModelo();
    this.horarioForm.reset();
    this.horarioForm.get('estado').setValue('A');
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

  get funcionarioIdNoValido() {
    return this.horarioForm.get('funcionarios').get('funcionarioId').invalid 
    && this.horarioForm.get('funcionarios').get('funcionarioId').touched
  }
  get fechaNoValido() {
    return this.horarioForm.get('fecha').invalid && this.horarioForm.get('fecha').touched
  }

  get horaInicioNoValido() {
    return this.horarioForm.get('horaInicio').invalid && this.horarioForm.get('horaInicio').touched
  }

  get horaFinNoValido() {
    return this.horarioForm.get('horaFin').invalid && this.horarioForm.get('horaFin').touched
  }

  crearFormulario() {
    this.horarioForm = this.fb.group({
      horarioDisponibleId  : [null, [] ],
      fecha  : [null, [Validators.required] ],
      horaInicio  : [null, [Validators.required] ],
      horaFin  : [null, [Validators.required] ],
      funcionarios : this.fb.group({
        funcionarioId  : [null, [] ],
        personas : this.fb.group({
          cedula  : [null, [] ],
          nombres  : [null, [] ],
          apellidos  : [null, [] ]
        })
      }),
      estado: [null, [] ],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ]     
    });

    this.buscadorFuncionariosForm = this.fb2.group({
      funcionarioId  : ['', [] ],
      cedula  : ['', [] ],
      nombres  : ['', [] ],
      apellidos: ['', [] ]   
    });

    this.horarioForm.get('horarioDisponibleId').disable();
    this.horarioForm.get('funcionarios').get('personas').get('cedula').disable();
    this.horarioForm.get('funcionarios').get('personas').get('nombres').disable();
    this.horarioForm.get('funcionarios').get('personas').get('apellidos').disable();

    this.horarioForm.get('fechaCreacion').disable();
    this.horarioForm.get('fechaModificacion').disable();
    this.horarioForm.get('usuarioCreacion').disable();
    this.horarioForm.get('usuarioModificacion').disable();
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
    .subscribe( resp => {
      this.loadBuscadorFuncionarios = false;
      this.funcionarios = resp;
    }, e => {
      this.loadBuscadorFuncionarios = false;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: e.status +'. '+ this.comunes.obtenerError(e)
      })
    });
  }

  limpiarModalFuncionarios(event) {
    event.preventDefault();
    this.buscadorFuncionariosForm.reset();
    this.funcionarios = [];
  }

  cerrarAlert(){
    this.alert=false;
  }

  crearTablaModelFuncionarios(){
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
      columns: [ { data: 'funcionarioId' }, { data: 'cedula' }, 
      { data: 'nombres' }, { data: 'apellidos' }]      
    };
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

  selectFuncionario(event, funcionario: FuncionarioModelo){
    this.modalService.dismissAll();
    if(funcionario.funcionarioId){
      this.horarioForm.get('funcionarios').get('funcionarioId').setValue(funcionario.funcionarioId);
    }
    this.funcionariosService.getFuncionario( funcionario.funcionarioId )
      .subscribe( (resp: FuncionarioModelo) => {         
        this.horarioForm.get('funcionarios').patchValue(resp);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: e.status +'. '+ this.comunes.obtenerError(e)
          })
          this.horarioForm.get('funcionarios').get('funcionarioId').setValue(null);
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
