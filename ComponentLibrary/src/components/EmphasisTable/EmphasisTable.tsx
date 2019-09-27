
import React from 'react';
import { IEmphasisTable } from './EmphasisTable.type';
let styles = require('./EmphasisTable.scss');

const EmphasisTable = (props: React.PropsWithChildren<IEmphasisTable>) => {
    return <div className={`${styles["table-wrapper"]}`}>
        <table>
            <thead>
                <tr>
                    <th>head1</th>
                    <th>head2</th>
                    <th>head3</th>
                    <th>head4</th>
                    <th>head5</th>
                    <th>head6</th>
                    <th>head7</th>
                    <th>head8</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>col1_head1</td>
                    <td>col2_head1</td>
                    <td>col3_head1</td>
                    <td>col4_head1</td>
                    <td>col5_head1</td>
                    <th>head6</th>
                    <th>head7</th>
                    <th>head8</th>
                </tr>
                <tr>
                    <td>col1_head1</td>
                    <td>col2_head1 col2_head1col2_head1</td>
                    <td>col3_head1</td>
                    <td>col4_head1</td>
                    <td>col5_head1</td>
                    <th>head6</th>
                    <th>head7</th>
                    <th>head8</th>
                </tr>
                <tr>
                    <td>col1_head1</td>
                    <td>col2_head1</td>
                    <td>col3_head1</td>
                    <td>col4_head1</td>
                    <td>col5_head1</td>
                    <th>head6</th>
                    <th>col2_head1 col2_head1col2_head1</th>
                    <th>col2_head1 col2_head1col2_head1</th>
                </tr>
                <tr>
                    <td>col1_head1</td>
                    <td>col2_head1</td>
                    <td>col3_head1</td>
                    <td>col4_head1</td>
                    <td>col5_head1</td>
                    <th>head6</th>
                    <th>head7</th>
                    <th>head8</th>
                </tr>
                <tr>
                    <td>col1_head1</td>
                    <td>col2_head1</td>
                    <td>col3_head1</td>
                    <td>col4_head1</td>
                    <td>col5_head1</td>
                    <th>head6</th>
                    <th>head7</th>
                    <th>head8</th>
                </tr>
                <tr>
                    <td>col1_head1</td>
                    <td>col2_head1</td>
                    <td>col3_head1</td>
                    <td>col4_head1</td>
                    <td>col5_head1</td>
                    <th>head6</th>
                    <th>head7</th>
                    <th>head8</th>
                </tr>
                <tr>
                    <td>col1_head1</td>
                    <td>col2_head1</td>
                    <td>col3_head1</td>
                    <td>col4_head1</td>
                    <td>col5_head1</td>
                    <th>head6</th>
                    <th>head7</th>
                    <th>head8</th>
                </tr>
                <tr>
                    <td>col1_head1</td>
                    <td>col2_head1</td>
                    <td>col3_head1</td>
                    <td>col4_head1</td>
                    <td>col5_head1</td>
                    <th>head6</th>
                    <th>head7</th>
                    <th>head8</th>
                </tr>
                <tr>
                    <td>col1_head1</td>
                    <td>col2_head1</td>
                    <td>col3_head1</td>
                    <td>col4_head1</td>
                    <td>col5_head1</td>
                    <th>head6</th>
                    <th>head7</th>
                    <th>head8</th>
                </tr>
                <tr>
                    <td>col1_head1</td>
                    <td>col2_head1</td>
                    <td>col3_head1</td>
                    <td>col4_head1</td>
                    <td>col5_head1</td>
                    <th>head6</th>
                    <th>head7</th>
                    <th>head8</th>
                </tr>
            </tbody>
        </table>
    </div>
}

export default EmphasisTable;