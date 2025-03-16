"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAgendaDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_agenda_dto_1 = require("./create-agenda.dto");
class UpdateAgendaDto extends (0, mapped_types_1.PartialType)(create_agenda_dto_1.CreateAgendaDto) {
}
exports.UpdateAgendaDto = UpdateAgendaDto;
//# sourceMappingURL=update-agenda.dto.js.map