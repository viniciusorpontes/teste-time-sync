import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/agendamentos"
})

export class AgendamentoService {

    buscarTodos() {
        return axiosInstance.get('/buscarTodos')
    }

    salvar(agendamentoDTO: TimeSync.AgendamentoDTO) {
        return axiosInstance.post('/salvar', agendamentoDTO)
    }

}