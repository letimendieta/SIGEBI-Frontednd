import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../../common/global-constants';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { DataTableDirective } from 'angular-datatables';
import { MedicamentoModelo } from 'src/app/modelos/medicamento.modelo';
import { MedicamentosService } from 'src/app/servicios/medicamentos.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-medicamentos',
  templateUrl: './medicamentos.component.html',
  styleUrls: ['./medicamentos.component.css']
})
export class MedicamentosComponent implements OnInit {
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  dtOptionsMedicamentos: any = {};
  dtTriggerMedicamentos : Subject<any> = new Subject<any>();

  medicamentos: MedicamentoModelo[] = [];
  buscadorForm: FormGroup;
  buscadorMedicamentosForm: FormGroup;
  cargando = false;  
  opcion = "";

  constructor( private medicamentosService: MedicamentosService,
               private comunes: ComunesService,
               public router: Router,
               private fb: FormBuilder) {    
  }

  ngOnInit() {    
    this.crearFormulario();
    this.crearTablaMedicamentos();
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
      },
      processing: true,
      columns: [
        {data:'#'}, {data:'medicamentoId'},
        {data:'codigo'}, {data:'medicamento'}, {data:'concentracion'},
        {data:'forma'}, {data:'viaAdmin'}, {data:'presentacion'},
        {data:'Editar'},
      ],
      dom: 'lBfrtip',
      buttons: [
        {
          extend:    'copy',
          text:      '<i class="far fa-copy"></i>',
          titleAttr: 'Copiar',
          className: 'btn btn-light',
          title:     'Listado de medicamentos',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5]
          },
        },
        {
          extend:    'csv',
          title:     'Listado de medicamentos',
          text:      '<i class="fas fa-file-csv"></i>',
          titleAttr: 'Exportar a CSV',
          className: 'btn btn-light',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5]
          },
        },
        {
          extend:    'excelHtml5',
          title:     'Listado de medicamentos',
          text:      '<i class="fas fa-file-excel"></i> ',
          titleAttr: 'Exportar a Excel',
          className: 'btn btn-light',
          autoFilter: true,
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5]
          }
        },          
        {
          extend:    'print',
          title:     'Listado de medicamentos',
          text:      '<i class="fa fa-print"></i> ',
          titleAttr: 'Imprimir',
          className: 'btn btn-light',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5]
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

  buscadorMedicamentos(event) {
    event.preventDefault();
    this.cargando = true;
    this.medicamentos = [];
    this.rerender();
    var buscador: MedicamentoModelo = new MedicamentoModelo();
    buscador = this.buscadorMedicamentosForm.getRawValue();
    var orderBy = "medicamentoId";
    var orderDir = "desc";
    this.medicamentosService.buscarMedicamentosFiltros(buscador, orderBy, orderDir)
    .subscribe( resp => {      
      this.medicamentos = resp;
      this.dtTriggerMedicamentos.next();
      this.cargando = false;
    }, e => {
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
      this.cargando = false;
      this.dtTriggerMedicamentos.next();
    });
  }

  limpiarMedicamentos(event) {
    event.preventDefault();
    this.buscadorMedicamentosForm.reset();
    this.medicamentos = [];
    this.rerender();
    this.dtTriggerMedicamentos.next();

  }

  editar(event, id: number) {
    event.preventDefault();
    this.router.navigate(['medicamento', id]);
  }

  borrarMedicamento(event, medicamento: MedicamentoModelo ) {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea borrar ${ medicamento.codigo }`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {
        let peticion: Observable<any>;
        peticion = this.medicamentosService.borrarMedicamento( medicamento.medicamentoId );

        peticion.subscribe( resp => {
          Swal.fire({
                    icon: 'success',
                    title: medicamento.codigo,
                    text: resp.mensaje,
                  }).then( resp => {
            if ( resp.value ) {
              this.buscadorMedicamentos(event);
            }
          });
        }, e => {            
            Swal.fire({
              icon: 'info',
              title: 'Algo salió mal',
              text: this.comunes.obtenerError(e),
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

    this.buscadorMedicamentosForm = this.fb.group({
      medicamentoId  : [null, [] ],
      codigo  : [null, [] ],
      medicamento : [null, [] ]
    });
  }

  ngAfterViewInit(): void {
    this.dtTriggerMedicamentos.next();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTriggerMedicamentos.unsubscribe();
  }
}
