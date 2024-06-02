import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/servicos"
})

export class ServicoService {

    buscarTodos() {
        return axiosInstance.get('/buscarTodos')
    }

    salvar(servico: TimeSync.Servico) {
        return axiosInstance.post('/salvar', servico)
    }

}