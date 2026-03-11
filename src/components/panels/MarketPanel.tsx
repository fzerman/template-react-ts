import { useState, useEffect } from "react";
import { Panel } from "../Panel";
import { LoadingIndicator } from "../LoadingIndicator";

export function MarketPanel() {
    const [loading, setLoading] = useState(true);

    // Simulate async data fetch — replace with real logic
    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(t);
    }, []);

    return (
        <Panel title="Market">
            {loading ? (
                <LoadingIndicator label="Fetching items..." />
            ) : (
                <p className="panel-placeholder">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Officia natus commodi, voluptas dolore provident impedit,
                    dolorum mollitia, minima doloribus alias quod nostrum vel
                    odit illo aspernatur sunt vitae eius. Impedit cupiditate
                    dolore corporis explicabo. Maiores explicabo totam deserunt
                    consectetur, corrupti doloremque debitis. Magnam aspernatur
                    repellat expedita omnis, autem ab dolorem quibusdam sed
                    labore earum architecto explicabo distinctio voluptatibus
                    voluptate at cupiditate libero aliquid illo? Illum impedit
                    voluptate asperiores ipsa. Officia sequi tempore, aperiam
                    quos repudiandae, velit consequatur, ab vero praesentium
                    corporis delectus soluta ad cupiditate neque fugiat? Fugiat,
                    aliquid veniam aut reprehenderit cupiditate earum optio
                    assumenda. Assumenda mollitia dicta quibusdam quisquam
                    dolorem eos cum, fugit dignissimos enim perspiciatis
                    reiciendis iure nobis at est temporibus atque molestiae
                    voluptate optio dolores laboriosam unde, pariatur velit.
                    Nisi laboriosam sunt, cumque consequatur saepe cum, animi
                    nesciunt fugiat earum enim perspiciatis atque autem tenetur
                    libero, nam mollitia ratione. Neque sequi soluta nemo cum
                    nobis, hic sint beatae inventore facilis aspernatur
                    molestias earum culpa recusandae fuga dolore, voluptatibus
                    officia impedit dignissimos id nihil eum, odit tenetur ab
                    fugiat. Facere aut ullam architecto, quo facilis sequi earum
                    natus nisi. Autem fugit nobis a. Enim fuga reprehenderit ex
                    odit veniam eius similique quaerat ipsa distinctio, impedit
                    inventore, corrupti accusamus deserunt! Ex inventore
                    veritatis repellat ipsam illo fuga incidunt debitis
                    repellendus, consequuntur magni ipsum laudantium veniam
                    eligendi eveniet iste, dicta sed exercitationem ducimus
                    obcaecati est quia! Officiis, quasi. Temporibus veniam
                    exercitationem architecto autem! Quia, provident. Eos
                    voluptate repudiandae molestiae dolor iusto deleniti dolores
                    cumque minus cupiditate suscipit amet aliquam quae saepe
                    distinctio dolorum nisi dolore praesentium consectetur, ea
                    explicabo quia ex tempora culpa? Reiciendis, dolor
                    perferendis error amet id ipsam dolorum, libero saepe
                    similique aliquid animi? Totam obcaecati placeat, sed cumque
                    eaque adipisci a aspernatur laudantium. Adipisci a et, hic
                    qui nam, alias necessitatibus quidem facere, esse cupiditate
                    deleniti odio voluptatum placeat. Placeat, soluta sunt
                    architecto natus magnam quia repellat est. Laborum animi
                    sequi amet tenetur cum magnam tempora inventore sed,
                    laboriosam sunt quaerat officiis voluptatibus corrupti
                    maxime non iure quo! Atque hic similique consectetur eaque
                    reiciendis delectus odit odio dolore! Natus veniam quae
                    beatae vel dolor numquam! Voluptatum, error. Optio nobis
                    quia, hic mollitia voluptatem omnis odio excepturi libero
                    laborum nostrum id veniam inventore culpa beatae quas
                    tenetur voluptatibus esse harum deleniti similique commodi
                    fuga dolorem blanditiis? Unde natus nulla ab laborum sed
                    dignissimos. Ad hic ducimus perferendis laboriosam
                    consectetur non. Necessitatibus perferendis unde porro eos
                    laboriosam esse facere id repellendus inventore sapiente
                    fugiat, consequatur recusandae at quidem aperiam rem sequi
                    ut iste quae accusantium deserunt quas dignissimos
                    asperiores? Omnis, totam rerum. Numquam quas reprehenderit
                    nihil minus, provident distinctio! Adipisci, nostrum omnis
                    ducimus totam accusantium, enim nam animi ab tenetur odio
                    pariatur perspiciatis vero rerum, iste recusandae suscipit
                    nihil unde a blanditiis dolore impedit veniam itaque?
                    Reiciendis accusamus, animi aliquam odio placeat officiis,
                    non illo debitis quae atque itaque ipsum vitae? Dolorum
                    expedita explicabo consequatur illo nam minima quam enim sit
                    in rerum et, assumenda cumque aliquid ad non! Nam quibusdam
                    magnam quidem libero. Reprehenderit blanditiis ex alias!
                </p>
            )}
        </Panel>
    );
}
