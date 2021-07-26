import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HorariosService } from '../../../servicios/horarios.service';
import { HorarioModelo } from '../../../modelos/horario.modelo';
import { PersonaModelo } from '../../../modelos/persona.modelo';
import { FuncionarioModelo } from '../../../modelos/funcionario.modelo';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../../common/global-constants';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { DataTableDirective } from 'angular-datatables';
import { AreaModelo } from 'src/app/modelos/area.modelo';
import { AreasService } from 'src/app/servicios/areas.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-horarios',
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.css']
})
export class HorariosComponent implements OnDestroy, OnInit {
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  dtOptions: any = {};
  dtTrigger : Subject<any> = new Subject<any>();

  horarios: HorarioModelo[] = [];  
  buscadorForm: FormGroup;
  listaAreas: AreaModelo;
  cargando = false;  
  funcionario: FuncionarioModelo = new FuncionarioModelo();
  funcionarioPersona: PersonaModelo = new PersonaModelo();

  constructor( private horariosService: HorariosService,
               public router: Router,
               private areasService: AreasService,
               private comunes: ComunesService,
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
        {data:'horarioDisponibleId'}, {data:'areas.codigo'}, {data:'fecha'}, {data:'horaInicio'},
        {data:'horaFin'}, {data:'funcionarios.funcionarioId'}, 
        {data:'funcionarios.personas.cedula'},
        {data:'funcionarios.personas.nombres'}, 
        {data:'funcionarios.personas.apellidos'},
        {data:'estado'},
        {data:'Editar'},
        {data:'Borrar'},
      ],
      columnDefs: [
      {
        width: "100px",
        targets: 2
      }
      ],
      dom: 'lBfrtip',
      buttons: [
        {
          extend:    'copy',
          text:      '<i class="far fa-copy"></i>',
          titleAttr: 'Copiar',
          className: 'btn btn-light',
          title:     'Listado de horarios',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
          },
        },
        {
          extend:    'csv',
          title:     'Listado de horarios',
          text:      '<i class="fas fa-file-csv"></i>',
          titleAttr: 'Exportar a CSV',
          className: 'btn btn-light',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
          },
        },
        {
          extend:    'excelHtml5',
          title:     'Listado de horarios',
          text:      '<i class="fas fa-file-excel"></i> ',
          titleAttr: 'Exportar a Excel',
          className: 'btn btn-light',
          autoFilter: true,
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          }
        },          
        {
          extend:    'print',
          title:     'Listado de horarios',
          text:      '<i class="fa fa-print"></i> ',
          titleAttr: 'Imprimir',
          className: 'btn btn-light',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
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

  buscadorHorarios(event) {
    event.preventDefault();
    this.cargando = true;
    this.horarios = [];
    this.rerender();
    this.funcionario = new FuncionarioModelo();
    this.funcionarioPersona = new PersonaModelo();
    var buscador: HorarioModelo = new HorarioModelo();

    this.funcionarioPersona.cedula = this.buscadorForm.get('funcionarios').get('cedula').value;
    this.funcionarioPersona.nombres = this.buscadorForm.get('funcionarios').get('nombres').value;
    this.funcionarioPersona.apellidos = this.buscadorForm.get('funcionarios').get('apellidos').value;
    this.funcionario.funcionarioId = this.buscadorForm.get('funcionarios').get('funcionarioId').value;
    
    var areas = new AreaModelo();
    areas.areaId = this.buscadorForm.get('areaId').value;
    if ( areas.areaId != null ){
      this.funcionario.areas = areas;
    }else{
      this.funcionario.areas = null;
    }    

    if(!this.funcionarioPersona.cedula && !this.funcionarioPersona.nombres 
      && !this.funcionarioPersona.apellidos ){
      this.funcionario.personas = null;
    }else{
      this.funcionario.personas = this.funcionarioPersona;
    }
    
    if(this.funcionario.personas == null && !this.funcionario.funcionarioId 
      && !this.funcionario.areas ){
      this.funcionario = null;
    }
    buscador.horarioDisponibleId =  this.buscadorForm.get('horarioDisponibleId').value;
    buscador.fecha =  this.buscadorForm.get('fecha').value;
    buscador.estado =  this.buscadorForm.get('estado').value;

    buscador.funcionarios = this.funcionario;
    
    this.horariosService.buscarHorariosFiltrosTabla(buscador)
    .subscribe( resp => {      
      this.horarios = resp;
      this.dtTrigger.next();
      this.cargando = false;
    }, e => {
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: e.status +'. '+ this.comunes.obtenerError(e),
      })
      this.cargando = false;
      this.dtTrigger.next();
    });
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

  limpiar(event) {
    event.preventDefault();
    this.buscadorForm.reset();
    this.horarios = [];
    this.rerender();
    this.dtTrigger.next();
  }

  editar(event, id: number) {
    event.preventDefault();
    this.router.navigate(['horario', id]);
  }

  borrarHorario(event, horario: HorarioModelo ) {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea borrar ${ horario.horarioDisponibleId }`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {
        let peticion: Observable<any>;
        peticion = this.horariosService.borrarHorario( horario.horarioDisponibleId );

        peticion.subscribe( resp => {
          Swal.fire({
                    icon: 'success',
                    title: horario.horarioDisponibleId.toString(),
                    text: resp.mensaje,
                  }).then( resp => {
            if ( resp.value ) {
              this.ngOnInit();
            }
          });
        }, e => {            
            Swal.fire({
              icon: 'info',
              title: 'Algo salió mal',
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
      horarioDisponibleId  : ['', [] ],
      fecha  : [null, [] ],
      estado: [null, [] ],
      areaId: [null, [] ],
      funcionarios : this.fb.group({
        funcionarioId  : ['', [] ],
        cedula  : ['', [] ],
        nombres  : ['', [] ],
        apellidos  : ['', [] ]           
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
