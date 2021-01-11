import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FuncionariosService } from '../../../servicios/funcionarios.service';
import { FuncionarioModelo } from '../../../modelos/funcionario.modelo';
import { PersonaModelo } from '../../../modelos/persona.modelo';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../../common/global-constants';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { DataTableDirective } from 'angular-datatables';
import { AreaModelo } from 'src/app/modelos/area.modelo';
import { AreasService } from 'src/app/servicios/areas.service';

@Component({
  selector: 'app-funcionarios',
  templateUrl: './funcionarios.component.html',
  styleUrls: ['./funcionarios.component.css']
})
export class FuncionariosComponent implements OnDestroy, OnInit {
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  dtOptions: any = {};
  dtTrigger : Subject<any> = new Subject<any>();

  funcionarios: FuncionarioModelo[] = [];
  listaAreas: AreaModelo;
  buscador: FuncionarioModelo = new FuncionarioModelo();
  buscadorForm: FormGroup;
  cargando = false;


  constructor( private funcionariosService: FuncionariosService,
              private comunes: ComunesService,
              private areasService: AreasService,
              private fb: FormBuilder ) {    
  }

  ngOnInit() {
    this.crearFormulario();
    this.crearTabla();
    this.listarAreas();
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
        {data:'funcionarioId'}, {data:'personas.cedula'}, {data:'personas.nombres'},
        {data:'personas.apellidos'}, {data:'areas.areaId'}, {data:'estado'},
        {data:'Editar'},
        {data:'Borrar'},
      ],
      dom: 'lBfrtip',
      buttons: [
        {
          extend:    'copy',
          text:      '<i class="far fa-copy"></i>',
          titleAttr: 'Copiar',
          className: 'btn btn-light',
          title:     'Listado de funcionarios',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6]
          },
        },
        {
          extend:    'csv',
          title:     'Listado de funcionarios',
          text:      '<i class="fas fa-file-csv"></i>',
          titleAttr: 'Exportar a CSV',
          className: 'btn btn-secondary',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6]
          },
        },
        {
          extend:    'excelHtml5',
          title:     'Listado de funcionarios',
          text:      '<i class="fas fa-file-excel"></i> ',
          titleAttr: 'Exportar a Excel',
          className: 'btn btn-success',
          autoFilter: true,
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6]
          }
        },          
        {
          extend:    'print',
          title:     'Listado de funcionarios',
          text:      '<i class="fa fa-print"></i> ',
          titleAttr: 'Imprimir',
          className: 'btn btn-info',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6]
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

  listarAreas() {
    var orderBy = "descripcion";
    var orderDir = "asc";
    var area = new AreaModelo();
    area.estado = "A";

    this.areasService.buscarAreasFiltros(area, orderBy, orderDir )
      .subscribe( (resp: AreaModelo) => {
        this.listaAreas = resp;
    });
  }

  buscadorFuncionarios(event) {
    event.preventDefault();
    this.cargando = true;
    this.funcionarios = [];
    this.rerender();
    var persona: PersonaModelo = new PersonaModelo();
    persona.cedula = this.buscadorForm.get('cedula').value;
    persona.nombres = this.buscadorForm.get('nombres').value;
    persona.apellidos = this.buscadorForm.get('apellidos').value;
    if( !persona.cedula && !persona.nombres && !persona.apellidos ){
      this.buscador.personas = null;
    }else{
      this.buscador.personas = persona;
    }    
    this.buscador.estado = this.buscadorForm.get('estado').value;    
    this.buscador.funcionarioId = this.buscadorForm.get('funcionarioId').value; 
    this.buscador.areas.areaId = this.buscadorForm.get('areas').get('areaId').value;
    this.funcionariosService.buscarFuncionariosFiltros(this.buscador)
    .subscribe( resp => {      
      this.funcionarios = resp;
      this.dtTrigger.next();
      this.cargando = false;
    }, e => {
      Swal.fire({
        icon: 'info',
        title: 'Algo salio mal',
        text: e.status +'. '+ this.comunes.obtenerError(e)
      })
      this.cargando = false;
      this.dtTrigger.next();
    });
  }

  limpiar(event) {
    event.preventDefault();
    this.buscadorForm.reset();
    this.buscador = new FuncionarioModelo();
    this.funcionarios = [];
    this.rerender();
    this.dtTrigger.next();
  }

  borrarFuncionario(event, funcionario: FuncionarioModelo ) {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea borrar a ${ funcionario.personas.nombres }`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {
        let peticion: Observable<any>;
        peticion = this.funcionariosService.borrarFuncionario( funcionario.funcionarioId );

        peticion.subscribe( resp => {
          Swal.fire({
                    icon: 'success',
                    title: funcionario.personas.nombres,
                    text: resp.mensaje,
                  }).then( resp => {
            if ( resp.value ) {
              this.ngOnInit();
            }
          });
        }, e => {              
            Swal.fire({
              icon: 'info',
              title: 'Algo salio mal',
              text: e.status +'. '+ this.comunes.obtenerError(e),
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
      funcionarioId  : ['', [] ],
      cedula  : ['', [] ],
      nombres  : ['', [] ],
      apellidos: ['', [] ],
      estado:  [null, [] ],
      areas  : this.fb.group({
        areaId: ['', [] ]
      })
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
