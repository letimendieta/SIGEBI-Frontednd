import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UsuariosService } from '../../../servicios/usuarios.service';
import { Usuario2Modelo } from '../../../modelos/usuario2.modelo';
import { PersonaModelo } from '../../../modelos/persona.modelo';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../../common/global-constants';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { DataTableDirective } from 'angular-datatables';
import { Router } from '@angular/router';
import { FuncionarioModelo } from 'src/app/modelos/funcionario.modelo';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnDestroy, OnInit {
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  dtOptions: any = {};
  dtTrigger : Subject<any> = new Subject<any>();

  usuarios: Usuario2Modelo[] = [];
  //persona: PersonaModelo = new PersonaModelo();
  //buscador: Usuario2Modelo = new Usuario2Modelo();
  buscadorForm: FormGroup;
  cargando = false;


  constructor( private usuariosService: UsuariosService,
    private comunes: ComunesService,
    public router: Router,
    private fb: FormBuilder ) {    
  }
  ngOnInit() {
    this.crearFormulario();
    this.crearTabla();
  }

  crearTabla(){
    this.dtOptions = {
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
      },
      processing: true,
      columns: [
        {data:'#'},
        {data:'id'}, {data:'nombreUsuario'}, {data:'funcionarios.personas.personaId'},
        {data:'funcionarios.funcionarioId'}, {data:'funcionarios.personas.cedula'}, {data:'funcionarios.personas.nombres'},
        {data:'funcionarios.personas.apellido'}, {data:'estado'},
        {data:'Editar'}//,
        //{data:'Borrar'}
      ],
      dom: 'lBfrtip',
      buttons: [
        {
          extend:    'copy',
          text:      '<i class="far fa-copy"></i>',
          titleAttr: 'Copiar',
          className: 'btn btn-light',
          title:     'Listado de stocks',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
          },
        },
        {
          extend:    'csv',
          title:     'Listado de stocks',
          text:      '<i class="fas fa-file-csv"></i>',
          titleAttr: 'Exportar a CSV',
          className: 'btn btn-light',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
          },
        },
        {
          extend:    'excelHtml5',
          title:     'Listado de stocks',
          text:      '<i class="fas fa-file-excel"></i> ',
          titleAttr: 'Exportar a Excel',
          className: 'btn btn-light',
          autoFilter: true,
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
          }
        },          
        {
          extend:    'print',
          title:     'Listado de stocks',
          text:      '<i class="fa fa-print"></i> ',
          titleAttr: 'Imprimir',
          className: 'btn btn-light',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
          },
          customize: function ( win ) {
            $(win.document.body)
                .css( 'font-size', '10pt' )
                .prepend(
                    '<img src= ' + GlobalConstants.imagenReporteListas + ' style="position:absolute; top:400; left:400;" />'
                );

            $(win.document.body).find( 'table' )
                .addClass( 'compact' )
                .css( 'font-size', 'inherit' );
          }              
        }
      ]
    };
  }

  buscadorUsuarios(event) {
    event.preventDefault();
    this.cargando = true;
    this.usuarios = [];
    this.rerender();
    var persona: PersonaModelo = new PersonaModelo();
    var buscador: Usuario2Modelo = new Usuario2Modelo();
    var funcionario: FuncionarioModelo = new FuncionarioModelo();
    persona.cedula = this.buscadorForm.get('cedula').value;
    persona.nombres = this.buscadorForm.get('nombres').value;
    persona.apellidos = this.buscadorForm.get('apellidos').value;

    funcionario.personas = persona;
    if( !persona.cedula && ! persona.nombres && !persona.apellidos ){
      buscador.funcionarios = null;
    }else{
      buscador.funcionarios = funcionario;
    }
    
    buscador.id = this.buscadorForm.get('id').value;
    buscador.nombreUsuario = this.buscadorForm.get('nombreUsuario').value;
    this.usuariosService.buscarUsuariosFiltros(buscador)
    .subscribe( resp => {      
      this.usuarios = resp;
      this.dtTrigger.next();
      this.cargando = false;
    }, e => {
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: e.status +'. '+ this.comunes.obtenerError(e)
      })
      this.cargando = false;
      this.dtTrigger.next();
    });
  }

  limpiar(event) {
    event.preventDefault();
    this.buscadorForm.reset();
    //this.buscador = new Usuario2Modelo();
    //this.persona = new PersonaModelo();   
    this.usuarios = [];
    this.rerender();
    this.dtTrigger.next();
  }

  editar(event, id: number) {
    event.preventDefault();
    this.router.navigate(['usuario', id]);
  }

  borrarUsuario(event, usuario: Usuario2Modelo ) {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea borrar a ${ usuario.nombreUsuario }`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {
        let peticion: Observable<any>;
        peticion = this.usuariosService.borrarUsuario( usuario.id );

        peticion.subscribe( resp => {
          Swal.fire({
                    icon: 'success',
                    title: usuario.nombreUsuario,
                    text: resp.mensaje,
                  }).then( resp => {
            if ( resp.value ) {
              this.buscadorUsuarios(event);
            }
          });
        }, e => {            
            Swal.fire({
              icon: 'info',
              title: 'Algo salió mal',
              text: e.status +'. '+ this.comunes.obtenerError(e)
            })
          }
        );
      }
    });
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

  crearFormulario() {

    this.buscadorForm = this.fb.group({
      id  : ['', [] ],
      nombreUsuario  : ['', [] ],
      cedula  : ['', [] ],
      nombres  : ['', [] ],
      apellidos: ['', [] ],
      estado: [null, [] ]
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}
