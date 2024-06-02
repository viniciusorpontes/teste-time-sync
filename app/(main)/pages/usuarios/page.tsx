'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TimeSync } from '@/types';
import { UsuarioService } from '@/service/UsuarioService';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';

const Usuario = () => {

    let usuarioVazio: TimeSync.Usuario = {
        id: 0,
        cpf: '',
        nome: '',
        email: '',
        telefone: '',
        senha: '',
        tipo: '',
        ativo: true
    };

    const [usuarios, setUsuarios] = useState(null);
    const [usuarioDialog, setUsuarioDialog] = useState(false);
    const [deleteUsuarioDialog, setDeleteUsuarioDialog] = useState(false);
    const [deleteUsuariosDialog, setDeleteUsuariosDialog] = useState(false);
    const [usuario, setUsuario] = useState<TimeSync.Usuario>(usuarioVazio);
    const [selectedUsuarios, setSelectedUsuarios] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const usuarioService = new UsuarioService();

    const tiposUsuarios = [
        { label: 'Administrador', value: 'ADMINISTRADOR' },
        { label: 'Cliente', value: 'CLIENTE' },
        { label: 'Consumidor', value: 'CONSUMIDOR' }
    ];

    const onTipoUsuarioChange = (e: DropdownChangeEvent) => {
        let _usuario = { ...usuario };
        _usuario.tipo = e.value;
        setUsuario(_usuario);
    };

    const buscarTodos = () => {
        usuarioService.buscarTodos()
            .then(response => setUsuarios(response.data))
            .catch(error => console.error(error))
    }

    useEffect(() => { buscarTodos() }, []);

    const openNew = () => {
        setUsuario(usuarioVazio);
        setSubmitted(false);
        setUsuarioDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setUsuarioDialog(false);
    };

    const hideDeleteUsuarioDialog = () => {
        setDeleteUsuarioDialog(false);
    };

    const hideDeleteUsuariosDialog = () => {
        setDeleteUsuariosDialog(false);
    };

    const saveUsuario = () => {
        setSubmitted(true);
        usuarioService.salvar(usuario)
            .then(response => {
                setUsuarioDialog(false)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Usuario salvo com sucesso',
                    life: 3000
                })
                setUsuario(usuarioVazio)
                buscarTodos()
            })
            .catch(error => {
                console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao salvar usuário - Erro: ' + error.message,
                    life: 3000
                })
            })
    };

    const editUsuario = (usuario: TimeSync.Usuario) => {
        setUsuario({ ...usuario });
        setUsuarioDialog(true);
    };

    const confirmDeleteUsuario = (usuario: TimeSync.Usuario) => {
        setUsuario(usuario);
        setDeleteUsuarioDialog(true);
    };

    const deleteUsuario = () => {
        const _usuario = usuario;
        _usuario.ativo = false;
        setUsuario(_usuario);

        usuarioService.salvar(usuario)
            .then(response => {
                setDeleteUsuarioDialog(false)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Usuario excluido com sucesso',
                    life: 3000
                })
                setUsuario(usuarioVazio)
                buscarTodos()
            })
            .catch(error => {
                console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao excluir usuário - Erro: ' + error.message,
                    life: 3000
                })
            })
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteUsuariosDialog(true);
    };

    const deleteSelectedUsuarios = () => {
        Promise.all(selectedUsuarios.map(async (_usuario: TimeSync.Usuario) => {
            _usuario.ativo = false;
            await usuarioService.salvar(_usuario);
        })).then((response) => {
            buscarTodos()
            setSelectedUsuarios([])
            setDeleteUsuariosDialog(false)
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Usuários deletados',
                life: 3000
            })
        }).catch((error) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao deletar usuários',
                life: 3000
            });
        });
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _usuario = { ...usuario };
        (_usuario as any)[name] = val;
        setUsuario(_usuario);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedUsuarios || !(selectedUsuarios as any).length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" />
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const idBodyTemplate = (rowData: TimeSync.Usuario) => {
        return (
            <>
                <span className="p-column-title">Código</span>
                {rowData.id}
            </>
        );
    };

    const cpfBodyTemplate = (rowData: TimeSync.Usuario) => {
        return (
            <>
                <span className="p-column-title">CPF</span>
                {rowData.cpf}
            </>
        );
    };

    const nomeBodyTemplate = (rowData: TimeSync.Usuario) => {
        return (
            <>
                <span className="p-column-title">Nome</span>
                {rowData.nome}
            </>
        );
    };

    const emailBodyTemplate = (rowData: TimeSync.Usuario) => {
        return (
            <>
                <span className="p-column-title">E-Mail</span>
                {rowData.email}
            </>
        );
    };

    const telefoneBodyTemplate = (rowData: TimeSync.Usuario) => {
        return (
            <>
                <span className="p-column-title">Telefone</span>
                {rowData.telefone}
            </>
        );
    };

    const tipoUsuarioBodyTemplate = (rowData: TimeSync.Usuario) => {
        return (
            <>
                <span className="p-column-title">Tipo</span>
                {rowData.tipo}
            </>
        );
    };

    const actionBodyTemplate = (rowData: TimeSync.Usuario) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editUsuario(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteUsuario(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gerenciamento de Usuários</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const usuarioDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveUsuario} />
        </>
    );
    const deleteUsuarioDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteUsuarioDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteUsuario} />
        </>
    );
    const deleteUsuariosDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteUsuariosDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSelectedUsuarios} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={usuarios}
                        selection={selectedUsuarios}
                        onSelectionChange={(e) => setSelectedUsuarios(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Exibindo {first} até {last} de {totalRecords} Usuários"
                        globalFilter={globalFilter}
                        emptyMessage="Nenhum usuário encontrado"
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="id" header="Código" sortable body={idBodyTemplate} headerStyle={{ minWidth: '6rem' }}></Column>
                        <Column field="cpf" header="CPF" sortable body={cpfBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="nome" header="Nome" sortable body={nomeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="email" header="E-Mail" sortable body={emailBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="telefone" header="Telefone" sortable body={telefoneBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="tipo" header="Tipo" sortable body={tipoUsuarioBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={usuarioDialog} style={{ width: '450px' }} header="Detalhes do Usuário" modal className="p-fluid" footer={usuarioDialogFooter} onHide={hideDialog}>

                        <div className="field">
                            <label htmlFor="cpf">CPF</label>
                            <InputText
                                id="cpf"
                                value={usuario.cpf}
                                onChange={(e) => onInputChange(e, 'cpf')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !usuario.cpf
                                })}
                            />
                            {submitted && !usuario.cpf && <small className="p-invalid">CPF é obrigatório.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="nome">Nome</label>
                            <InputText
                                id="nome"
                                value={usuario.nome}
                                onChange={(e) => onInputChange(e, 'nome')}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !usuario.nome
                                })}
                            />
                            {submitted && !usuario.nome && <small className="p-invalid">Nome é obrigatório.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="email">E-Mail</label>
                            <InputText
                                id="email"
                                value={usuario.email}
                                onChange={(e) => onInputChange(e, 'email')}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !usuario.email
                                })}
                            />
                            {submitted && !usuario.email && <small className="p-invalid">E-Mail é obrigatório.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="telefone">Telefone</label>
                            <InputText
                                id="telefone"
                                value={usuario.telefone}
                                onChange={(e) => onInputChange(e, 'telefone')}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !usuario.telefone
                                })}
                            />
                            {submitted && !usuario.telefone && <small className="p-invalid">Telefone é obrigatório.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="tipo">Tipo</label>
                            <Dropdown id="tipo" value={usuario.tipo} onChange={onTipoUsuarioChange} options={tiposUsuarios} required></Dropdown>
                            {submitted && !usuario.tipo && <small className="p-invalid">Tipo usuário é obrigatório.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="senha">Senha</label>
                            <InputText
                                id="senha"
                                value={usuario.senha}
                                onChange={(e) => onInputChange(e, 'senha')}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !usuario.senha
                                })}
                            />
                            {submitted && !usuario.senha && <small className="p-invalid">Senha é obrigatória.</small>}
                        </div>

                    </Dialog>

                    <Dialog visible={deleteUsuarioDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteUsuarioDialogFooter} onHide={hideDeleteUsuarioDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {usuario && (
                                <span>
                                    Você realmente deseja excluir o usuário <b>{usuario.nome}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteUsuariosDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUsuariosDialogFooter} onHide={hideDeleteUsuariosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {usuario && <span>Você realmente deseja excluir os usuários selecionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Usuario;