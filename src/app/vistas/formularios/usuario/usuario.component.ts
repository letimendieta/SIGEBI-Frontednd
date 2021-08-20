import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario2Modelo } from '../../../modelos/usuario2.modelo';
import { ParametroModelo } from '../../../modelos/parametro.modelo';
import { PersonaModelo } from '../../../modelos/persona.modelo';
import { FuncionarioModelo } from '../../../modelos/funcionario.modelo';
import { AreaModelo } from '../../../modelos/area.modelo';
import { AreasService } from '../../../servicios/areas.service';
import { UsuariosService } from '../../../servicios/usuarios.service';
import { FuncionariosService } from '../../../servicios/funcionarios.service';
import { PersonasService } from '../../../servicios/personas.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ComunesService } from 'src/app/servicios/comunes.service';
import Swal from 'sweetalert2';
import { nuevoUsuarioModelo } from 'src/app/modelos/nuevoUsuario.modelo';
import { DualListComponent } from 'angular-dual-listbox';
import { RolModelo } from 'src/app/modelos/rol.modelo';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {
  crear = false;
  //usuario: Usuario2Modelo = new Usuario2Modelo();
  persona: PersonaModelo = new PersonaModelo();
  personas: PersonaModelo[] = [];
  funcionarios: FuncionarioModelo[] = [];
  listaEstadoCivil: ParametroModelo;
  listaSexo: ParametroModelo;
  listaNacionalidad: ParametroModelo;
  listaAreas: AreaModelo;
  usuarioForm: FormGroup;
  buscadorPersonasForm: FormGroup;
  buscadorFuncionariosForm: FormGroup;
  alert:boolean=false;
  alertGuardar:boolean=false;
  dtOptions: any = {};
  cargando = false;
  listaRoles = [];
  sourceStations: any;
  confirmedStations: any;

  key: string;
  display: any;
  keepSorted: boolean;
  source2: any;
  confirmed: any;
  id:any;
  permisosSeleccionados: boolean;
  loadBuscadorFuncionarios = false;
  esCambioContrasenha : boolean = false;

  format = {
    add: 'Agregar', remove: 'Remover', all: 'Todos', none: 'Ninguno',
    direction: DualListComponent.LTR, draggable: true, locale: 'da'
  };

  constructor( private tokenService: TokenService,
               private usuariosService: UsuariosService,
               private funcionariosService: FuncionariosService,
               private personasService: PersonasService,
               private areasService: AreasService,
               private route: ActivatedRoute,
               private router: Router,
               private comunes: ComunesService,
               private fb: FormBuilder,
               private fb2: FormBuilder,
               private fb3: FormBuilder,
               private modalService: NgbModal  ) { 
    this.crearFormulario();
  }              

  ngOnInit() {
    this.listarAreas();
    const id = this.route.snapshot.paramMap.get('id');
    this.listarRoles(Number(id));
    if ( id !== 'nuevo' ) {
      this.usuarioForm.get('funcionarios').get('funcionarioId').disable();
      this.usuarioForm.get('password').disable();
      this.usuariosService.getUsuario( Number(id) )
        .subscribe( (resp: Usuario2Modelo) => {
          this.usuarioForm.patchValue(resp);
        });
    }else{
      this.crear = true;
      this.usuarioForm.get('estado').setValue('A');
      this.usuarioForm.get('nombreUsuario').enable();
    }
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

  listarRoles(id : number) {    
    this.usuariosService.listarRoles()
    .subscribe( (resp : any) => {      
      if ( resp.length > 0){
        this.listaRoles = resp;
        this.doReset();

        if(typeof id !== 'undefined'){
          this.id =id;
          this.buscarUsuario(id);
          /*this.usuariosService.getUsuario(id).subscribe((r: any) =>{
              this.confirmed = r
              if(r.length>0){
                this.permisosSeleccionados = true;
              }
          }*/          
        }

      }else{
        Swal.fire({
          icon: 'info',
          text: 'No se encontraron roles'
        })   
      }
    });
    
  }

  doReset(data?) {
    this.sourceStations = JSON.parse(JSON.stringify(this.listaRoles));
    this.confirmedStations = new Array<any>( );
    this.useStations();
  }

  private useStations() {
    this.key = 'id';
    this.display = this.stationLabel;
    this.keepSorted = true;
    this.source2 = this.sourceStations;
    this.confirmed = this.confirmedStations;
  }

  echo(e) {      
    if (e.length > 0) {
      this.permisosSeleccionados = true;
    } else {
      this.permisosSeleccionados = false;
    }
  }

  private stationLabel(item: any) {
    return item.rolNombre;
  }

  obtenerFuncionario( event: { preventDefault: () => void; } ){
    event.preventDefault();
    var id = this.usuarioForm.get('funcionarios').get('funcionarioId').value;
    this.funcionariosService.getFuncionario( id )
        .subscribe( (resp: FuncionarioModelo) => {
          this.usuarioForm.get('funcionarios').patchValue(resp);  
          var personaId = this.usuarioForm.get('funcionarios').get("personas").get("personaId").value;
          var funcionarioId = this.usuarioForm.get('funcionarios').get("funcionarioId").value;
          this.buscarFuncionarioUsuario(funcionarioId);
          this.generarNombreUsuario(personaId);
        }, e => {
            Swal.fire({
              icon: 'info',
              text: this.comunes.obtenerError(e),
            })
          }
        );
  }

  generarNombreUsuario ( personaId: number ){
    this.usuariosService.generarNombreUsuario(personaId)
    .subscribe( (resp : Usuario2Modelo ) => {
      this.usuarioForm.get('nombreUsuario').setValue(resp.nombreUsuario);
      this.buscarNombreUsuario(resp.nombreUsuario);
    }, e => {
      console.log(this.comunes.obtenerError(e));
    });
  }

  buscarNombreUsuario( nombreUsurio: string){
    var buscador: Usuario2Modelo = new Usuario2Modelo();
    
    buscador.nombreUsuario = nombreUsurio;
    this.usuariosService.buscarUsuariosFiltrosTabla(buscador)
    .subscribe( resp => {      
      if ( resp.length > 0){
        Swal.fire({
          icon: 'info',
          text: 'Nombre de usuario ya existe'
        })        
      }
    });
  }

  buscarUsuario( id: number){

    this.usuariosService.getUsuario(id)
    .subscribe( ( resp : Usuario2Modelo )=> {   
      var rolesUsuario : RolModelo [] = []; 
      resp.roles.forEach(rol => {
          rolesUsuario.push(rol);
      });
      this.confirmed = rolesUsuario;
    });
  }

  buscarFuncionarioUsuario( funcionarioId: number){
    var buscador: Usuario2Modelo = new Usuario2Modelo();
    var funcionario: FuncionarioModelo = new FuncionarioModelo();

    funcionario.funcionarioId = funcionarioId;
    buscador.funcionarios = funcionario;
    
    this.usuariosService.buscarUsuariosFiltrosTabla(buscador)
    .subscribe( resp => {       
      if ( resp.length > 0){
        Swal.fire({
          icon: 'info',
          text: 'El funcionario ya cuenta con un usuario'
        })
      }
    });
  }
    
  guardar( ) {
    this.cerrarAlertGuardar();
    if ( this.usuarioForm.invalid ){
      this.alertGuardar = true;
      return Object.values( this.usuarioForm.controls ).forEach( control => {
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    }

    if( !this.crear ){
      if(!this.usuarioForm.get('password').value || this.usuarioForm.get('password').value == "" ){
        Swal.fire({
          icon: 'info',
          title: 'Ingrese la contraseña',
        }) 
      }
    }

    Swal.fire({
      title: 'Espere',
      text: 'Guardando información',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    let peticion: Observable<any>; 
    var usuario = new Usuario2Modelo();
    var nuevoUsuario = new nuevoUsuarioModelo();
    usuario = this.usuarioForm.getRawValue();

    nuevoUsuario.usuario = usuario;

    nuevoUsuario.esCambioContrasenha = this.esCambioContrasenha;

    var listaRoles : Array<RolModelo> = [];
    for (let i = 0; i < this.confirmed.length; i++) {
      listaRoles.push(this.confirmed[i]);
    }
    if( listaRoles.length > 0 ){
      nuevoUsuario.rolesList = listaRoles;
    }

    if ( usuario.id ) {
      usuario.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.usuariosService.actualizarUsuario( nuevoUsuario );
    } else {
      usuario.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.usuariosService.crearUsuario( nuevoUsuario );
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: usuario.nombreUsuario ? usuario.nombreUsuario.toString() : '',
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( usuario.id ) {
            this.router.navigate(['/usuarios']);
          }else{
            this.limpiar(event);
            this.listarRoles(null);
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

  cambiarContrasenha(event) {
    if( event == true ){
      this.usuarioForm.get('password').enable();
      this.esCambioContrasenha = true;
    }else{
      this.usuarioForm.get('password').disable();
      this.esCambioContrasenha = false;
    }
  }

  limpiar(event: Event){
    event.preventDefault();
    this.usuarioForm.reset();
    this.usuarioForm.get('estado').setValue('A');
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

  get usuarioNoValido() {
    return this.usuarioForm.get('nombreUsuario').invalid 
      && this.usuarioForm.get('nombreUsuario').touched
  }
  
  get estadoNoValido() {
    return this.usuarioForm.get('estado').invalid 
      && this.usuarioForm.get('estado').touched
  }

  crearFormulario() {
    this.usuarioForm = this.fb.group({
      id  : [null, [] ],
      funcionarios : this.fb.group({
        funcionarioId  : [null, [] ],
        personas : this.fb.group({
          personaId : [null, [Validators.required] ],
          cedula : [null, [] ],
          nombres : [null, [] ],
          apellidos : [null, [] ]
        }),
        areas  : this.fb.group({
          areaId: [null, [ Validators.required] ]
        }),
        estado : [null, [] ]
      }),            
      nombreUsuario : [null, [Validators.required] ],
      password : [null, [Validators.required] ],
      estado : [null, [Validators.required] ],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ],             
    });

    this.buscadorPersonasForm = this.fb2.group({
      personaId  : ['', [] ],
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

    this.usuarioForm.get('id').disable();
    this.usuarioForm.get('nombreUsuario').disable();
    this.usuarioForm.get('funcionarios').get('areas').get('areaId').disable();
    this.usuarioForm.get('funcionarios').get('estado').disable();

    this.usuarioForm.get('funcionarios').get('personas').get('cedula').disable();
    this.usuarioForm.get('funcionarios').get('personas').get('nombres').disable();
    this.usuarioForm.get('funcionarios').get('personas').get('apellidos').disable();

    this.usuarioForm.get('fechaCreacion').disable();
    this.usuarioForm.get('fechaModificacion').disable();
    this.usuarioForm.get('usuarioCreacion').disable();
    this.usuarioForm.get('usuarioModificacion').disable();
  }



  buscadorPersonas(event: { preventDefault: () => void; }) {
    event.preventDefault();
    
    var persona: PersonaModelo = new PersonaModelo();

    persona.cedula = this.buscadorPersonasForm.get('cedula').value;
    persona.nombres = this.buscadorPersonasForm.get('nombres').value;
    persona.apellidos = this.buscadorPersonasForm.get('apellidos').value;

    if(!persona.cedula 
      && !persona.nombres && !persona.apellidos){
      this.alert=true;
      return;
    }
    this.cargando = true;
    this.personasService.buscarPersonasFiltrosTabla(persona)
    .subscribe( resp => {
      this.personas = resp;
      this.cargando = false;
    }, e => {
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
      this.cargando = false;
    });
  }

  buscadorFuncionarios(event: { preventDefault: () => void; }) {
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
        text: this.comunes.obtenerError(e)
      })
    });
  }

  limpiarModalPersonas(event: { preventDefault: () => void; }) {
    event.preventDefault();
    this.buscadorPersonasForm.reset();
    this.personas = [];
  }

  limpiarModalFuncionarios(event: { preventDefault: () => void; }) {
    event.preventDefault();
    this.buscadorFuncionariosForm.reset();
    this.funcionarios = [];
  }

  cerrarAlert(){
    this.alert=false;
  }

  crearTablaModelpersonas(){
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
      columns: [ { data: 'personaId' }, { data: 'cedula' }, 
      { data: 'nombres' }, { data: 'apellidos' }]      
    };
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

  openModalPersonas(targetModal: any) {
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });
   
    this.buscadorPersonasForm.patchValue({
      personaId: '',
      cedula: '',
      nombres: '',
      apellidos: ''
    });
    this.personas = [];
    this.alert=false;
  }

  openModalFuncionarios(targetModal: any) {
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

  selectFuncionario(event: any, funcionario: FuncionarioModelo){
    this.modalService.dismissAll();
    if(funcionario.funcionarioId){
      this.usuarioForm.get('funcionarios').get('funcionarioId').setValue(funcionario.funcionarioId);
    }
    this.funcionariosService.getFuncionario( funcionario.funcionarioId )
      .subscribe( (resp: FuncionarioModelo) => {         
        this.usuarioForm.get('funcionarios').patchValue(resp);
        var personaId = this.usuarioForm.get('funcionarios').get("personas").get("personaId").value;
        var funcionarioId = this.usuarioForm.get('funcionarios').get("funcionarioId").value;
        this.buscarFuncionarioUsuario(funcionarioId);
        this.generarNombreUsuario(personaId);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
          this.usuarioForm.get('funcionarios').get('funcionarioId').setValue(null);
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
